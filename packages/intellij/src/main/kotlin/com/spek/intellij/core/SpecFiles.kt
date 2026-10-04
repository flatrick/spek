package com.spek.intellij.core

import java.io.File
import java.io.IOException
import java.nio.file.Files
import java.nio.file.InvalidPathException
import java.nio.file.LinkOption
import java.nio.file.Path
import java.nio.file.attribute.BasicFileAttributes

/**
 * Mirror of @spekjs/core's spec-files.ts: which `spec.md` files under a `specs/` root are specs, by
 * OpenSpec's own rule (`discoverSpecFiles`, OpenSpec #1353). Dot-entries are skipped and symlinked
 * directories are not followed; a `spec.md` directly in the root is not a spec; a regular `spec.md` is
 * one, and so is a symlinked one whose real target is a regular file inside the root or, failing that,
 * inside its own capability directory; a dangling link is skipped.
 *
 * Where OpenSpec throws (a link escaping both, an unreadable directory), this omits the entry and keeps
 * scanning: spek is a viewer, and failing would blank the whole repository over one bad entry.
 */
object SpecFiles {

    data class SpecFile(val topic: String, val file: File)

    /** Every spec under [specsRoot], ordered by topic in code-unit order. A missing root is empty. */
    fun discover(specsRoot: File): List<SpecFile> = walk(specsRoot).toList().sortedBy { it.topic }

    /** True when [specsRoot] holds at least one spec. Stops at the first. */
    fun hasAny(specsRoot: File): Boolean = walk(specsRoot).any()

    /**
     * The `spec.md` of [topic] under [specsRoot], or null — only when discovery would list that topic:
     * every intermediate directory must be a real directory (not a link), and a linked `spec.md` must
     * pass discovery's target rule. Containment alone would admit `.drafts/x` or a path through a
     * symlinked directory, neither of which the list shows.
     */
    fun resolve(specsRoot: File, topic: String): File? {
        if (!SpecTopic.isSafeTopic(topic)) return null
        return try {
            var dir = specsRoot.toPath()
            for (segment in topic.split('/')) {
                val next = dir.resolve(segment)
                // A segment that resolves anywhere but directly under its parent (a drive-relative
                // `C:x` on Windows) is not a child directory.
                if (next.parent != dir) return null
                val attrs = attributes(next) ?: return null
                if (!attrs.isDirectory) return null
                dir = next
            }
            val file = dir.resolve("spec.md")
            val attrs = attributes(file) ?: return null
            when {
                attrs.isRegularFile -> file.toFile()
                attrs.isSymbolicLink && isAcceptedLink(specsRoot.toPath(), dir, file) -> file.toFile()
                else -> null
            }
        } catch (e: InvalidPathException) {
            null
        }
    }

    private fun walk(specsRoot: File): Sequence<SpecFile> = sequence {
        visit(specsRoot.toPath(), specsRoot.toPath(), emptyList())
    }

    private suspend fun SequenceScope<SpecFile>.visit(root: Path, dir: Path, segments: List<String>) {
        val entries = try {
            Files.newDirectoryStream(dir).use { it.toList() }
        } catch (e: IOException) {
            return
        }
        for (entry in entries) {
            val name = entry.fileName.toString()
            if (name.startsWith(".")) continue
            val attrs = attributes(entry) ?: continue
            if (attrs.isDirectory) {
                visit(root, entry, segments + name)
            } else if (name == "spec.md" && segments.isNotEmpty()) {
                if (attrs.isRegularFile || (attrs.isSymbolicLink && isAcceptedLink(root, dir, entry))) {
                    yield(SpecFile(segments.joinToString("/"), entry.toFile()))
                }
            }
        }
    }

    /** The entry's own attributes, not its target's. Null when it cannot be read. */
    private fun attributes(path: Path): BasicFileAttributes? = try {
        Files.readAttributes(path, BasicFileAttributes::class.java, LinkOption.NOFOLLOW_LINKS)
    } catch (e: IOException) {
        null
    }

    private fun isAcceptedLink(root: Path, capabilityDir: Path, file: Path): Boolean = try {
        if (!Files.isRegularFile(file)) {
            false
        } else {
            val target = file.toRealPath()
            target.startsWith(root.toRealPath()) || target.startsWith(capabilityDir.toRealPath())
        }
    } catch (e: IOException) {
        false
    }
}
