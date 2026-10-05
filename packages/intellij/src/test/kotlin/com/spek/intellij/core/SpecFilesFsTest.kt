package com.spek.intellij.core

import java.io.File
import java.io.IOException
import java.nio.file.DirectoryIteratorException
import java.nio.file.DirectoryStream
import java.nio.file.Files
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/** Filesystem failures this machine cannot produce on demand, through [SpecFiles.Fs]. */
class SpecFilesFsTest {

    private fun specsRoot(vararg topics: String): File {
        val root = Files.createTempDirectory("spek-specfiles-fs-").toFile()
        for (topic in topics) File(root, "$topic/spec.md").apply { parentFile.mkdirs(); writeText("x") }
        return root
    }

    /** Lists [failing] as a stream that breaks on its first read, the way a vanishing directory does. */
    private class FailingIteration(private val failing: String) : SpecFiles.Fs by SpecFiles.RealFs {
        override fun open(dir: Path): DirectoryStream<Path> {
            if (dir.fileName?.toString() != failing) return SpecFiles.RealFs.open(dir)
            return object : DirectoryStream<Path> {
                override fun iterator(): MutableIterator<Path> = object : MutableIterator<Path> {
                    override fun hasNext(): Boolean = throw DirectoryIteratorException(IOException("gone"))
                    override fun next(): Path = throw NoSuchElementException()
                    override fun remove() = throw UnsupportedOperationException()
                }

                override fun close() {}
            }
        }
    }

    @Test
    fun `a directory iteration error is not an IOException`() {
        assertFalse(IOException::class.java.isAssignableFrom(DirectoryIteratorException::class.java))
        assertTrue(RuntimeException::class.java.isAssignableFrom(DirectoryIteratorException::class.java))
    }

    @Test
    fun `a directory that fails mid-iteration is omitted and the scan goes on`() {
        val root = specsRoot("a", "b/c")
        assertEquals(listOf("a"), SpecFiles.discover(root, FailingIteration("b")).map { it.topic })
    }
}
