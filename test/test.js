const assert = require("assert")
const ArchiveReader = require("../ArchiveReader.js")

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

        describe(tuple.type + " archives", () =>
        {
          it("should return the file list with getFileList()", () =>
          {
            assert.deepStrictEqual(archive.getFileList(),
              ["test/test1.txt",
                "test/test2.txt",
                "test/subdirectory/test3.txt"])
          })
          it("should position the archive at the first file by default", () =>
          {
            assert.equal(archive.getCurrentFileName(), "test/test1.txt")
          })
          it("moveToNextFile() and moveToPreviousFile()", () =>
          {
            archive.moveToNextFile()
            assert.equal(archive.getCurrentFileName(), "test/test2.txt")
            archive.moveToNextFile()
            assert.equal(archive.getCurrentFileName(), "test/subdirectory/test3.txt")
            archive.moveToNextFile()
            assert.equal(archive.getCurrentFileName(), "test/test1.txt")
            archive.moveToPreviousFile()
            assert.equal(archive.getCurrentFileName(), "test/subdirectory/test3.txt")
            archive.moveToPreviousFile()
            assert.equal(archive.getCurrentFileName(), "test/test2.txt")
          })
          it("moveToPosition()", () =>
          {
            archive.moveToPosition(0)
            assert.equal(archive.getCurrentFileName(), "test/test1.txt")
          })
          it("getCurrentFile()", (done) => 
          {
            archive.getCurrentFile((buffer) =>
            {
              if (buffer.toString() === "test1")
                done()
              else
                done(new Error(buffer.toString() + "!='test1'"))
            })
          })
        })
      });
  })
})
