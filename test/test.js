const assert = require("assert")
const ArchiveReader = require("../ArchiveReader")
const naturalComparer = require("../naturalComparer")

describe("ArchiveReader", function ()
{
  let zipArchive = new ArchiveReader.ArchiveReader("test/test.zip")
  let rarArchive = new ArchiveReader.ArchiveReader("test/test.rar")
  before((done) =>
  {
    zipArchive.executeWhenLoaded(() =>
    {
      rarArchive.executeWhenLoaded(done)
    })
  })
  describe("Archives", () =>
  {
    [{ archive: zipArchive, type: "zip" },
    { archive: rarArchive, type: "rar" }]
      .forEach(tuple =>
      {
        let archive = tuple.archive

        let filenames = ["test/filename with  spaces.txt",
          "test/test.txt",
          "test/テスト.txt",
          "test/subdirectory/file in subdirectory.txt"]

        describe(tuple.type + " archives", () =>
        {
          it("should return the file list with getFileList()", () =>
          {
            assert.deepStrictEqual(archive.getFileList(),
              filenames)
          })
          it("should position the archive at the first file by default", () =>
          {
            assert.equal(archive.getCurrentFileName(), filenames[0])
          })
          it("moveToNextFile() and moveToPreviousFile()", () =>
          {
            archive.moveToNextFile()
            assert.equal(archive.getCurrentFileName(), filenames[1])
            archive.moveToNextFile()
            assert.equal(archive.getCurrentFileName(), filenames[2])
            archive.moveToNextFile()
            assert.equal(archive.getCurrentFileName(), filenames[3])
            archive.moveToNextFile()
            assert.equal(archive.getCurrentFileName(), filenames[0])
            archive.moveToPreviousFile()
            assert.equal(archive.getCurrentFileName(), filenames[3])
            archive.moveToPreviousFile()
            assert.equal(archive.getCurrentFileName(), filenames[2])
          })
          it("moveToPosition()", () =>
          {
            archive.moveToPosition(1)
            assert.equal(archive.getCurrentFileName(), filenames[1])
          })
          it("getCurrentFile()", (done) => 
          {
            // Assuming that the previous tests moved me to the "test/test.txt" file
            archive.getCurrentFile((error, buffer) =>
            {
              assert.ifError(error)
              if (buffer.toString() === "test1")
                done()
              else
                done(new Error(buffer.toString() + "!='test1'"))
            })
          })
        })
      })
  })
})

describe("naturalComparer", function ()
{
  it("should order alphabetically when there are no numbers", () =>
  {
    assert.ok(naturalComparer.compare("abc", "def") < 0)
  })
  it("should put less deeply nested files first", () =>
  {
    assert.ok(naturalComparer.compare("test/test", "testtesttesttesttest") > 0)
  })

})