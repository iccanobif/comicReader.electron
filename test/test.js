const assert = require("assert")
const fs = require("fs")
const path = require("path")
const ArchiveReader = require("../ArchiveReader")
const naturalComparer = require("../naturalComparer")
const { ComicLibrary } = require("../ComicLibrary")
const utils = require("../utils.js")

describe("Utils", function () {
  const getTestFileName = i => {
    return path.join("test", "filenameTests", "Chapter 0" + i + ".zip")
  }
  it("findNextArchive() (go forward)", async () =>
  {
    assert.equal(await utils.findNextArchive(getTestFileName(1), true), getTestFileName(2))
    assert.equal(await utils.findNextArchive(getTestFileName(2), true), getTestFileName(3))
    assert.equal(await utils.findNextArchive(getTestFileName(3), true), getTestFileName(1))
  })
  it("findNextArchive() (go backwards)", async () =>
  {
    assert.equal(await utils.findNextArchive(getTestFileName(1), false), getTestFileName(3))
    assert.equal(await utils.findNextArchive(getTestFileName(2), false), getTestFileName(1))
    assert.equal(await utils.findNextArchive(getTestFileName(3), false), getTestFileName(2))
  })
})

describe("ArchiveReader", function ()
{
  let zipArchive = new ArchiveReader.ArchiveReader("test/test.zip")
  let rarArchive = new ArchiveReader.ArchiveReader("test/test.rar")
  before(() =>
  {
    return Promise.all([zipArchive.initialize(), rarArchive.initialize()])
  })
  describe("Archives", () =>
  {
    [{ archive: zipArchive, type: "zip" },
    { archive: rarArchive, type: "rar" }]
      .forEach(tuple =>
      {
        let archive = tuple.archive

        let filenames = ["test/filename with  spaces.png",
          "test/test.png",
          "test/テスト.jpg",
          "test/subdirectory/file in subdirectory.JPEG"]

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
              fileContent = Buffer.from(['137', '80', '78', '71', '13', '10', '26', '10', '0', '0', '0', '13', '73', '72', '68', '82', '0', '0', '0', '96', '0', '0', '0', '85', '8', '2', '0', '0', '0', '57', '77', '118', '113', '0', '0', '0', '1', '115', '82', '71', '66', '0', '174', '206', '28', '233', '0', '0', '0', '4', '103', '65', '77', '65', '0', '0', '177', '143', '11', '252', '97', '5', '0', '0', '0', '9', '112', '72', '89', '115', '0', '0', '14', '195', '0', '0', '14', '195', '1', '199', '111', '168', '100', '0', '0', '2', '169', '73', '68', '65', '84', '120', '94', '237', '155', '61', '150', '218', '48', '20', '70', '61', '89', '139', '153', '34', '103', '86', '160', '172', '192', '76', '147', '106', '150', '96', '202', '161', '201', '14', '210', '165', '33', '37', '94', '66', '170', '52', '49', '43', '192', '43', '224', '76', '129', '216', '11', '145', '194', '27', '244', '131', '225', '27', '139', '88', '80', '124', '183', '25', '49', '150', '124', '158', '174', '245', '164', '103', '206', '225', '97', '191', '223', '23', '228', '60', '159', '228', '47', '57', '3', '5', '1', '40', '8', '64', '65', '0', '10', '2', '80', '16', '128', '130', '0', '20', '4', '160', '32', '0', '5', '1', '40', '8', '64', '65', '0', '10', '2', '80', '16', '128', '130', '0', '20', '4', '160', '32', '0', '5', '1', '40', '8', '64', '65', '0', '10', '2', '80', '16', '128', '130', '0', '20', '4', '160', '32', '0', '5', '1', '40', '8', '64', '65', '0', '10', '2', '80', '16', '128', '130', '0', '169', '130', '118', '171', '217', '195', '145', '217', '106', '39', '255', '206', '74', '150', '24', '146', '87', '208', '118', '35', '13', '195', '102', '43', '141', '204', '228', '136', '129', '41', '6', '160', '32', '196', '126', '32', '122', '161', '100', '100', '63', '117', '43', '29', '29', '90', '183', '139', '90', '249', '195', '148', '82', '245', '162', '213', '114', '253', '148', '158', '1', '181', '55', '32', '33', '134', '100', '6', '11', '106', '107', '137', '226', '12', '106', '17', '204', '91', '155', '153', '202', '149', '30', '84', '125', '106', '169', '189', '48', '64', '102', '62', '48', '134', '171', '24', '117', '5', '161', '190', '255', '8', '30', '55', '24', '33', '125', '239', '122', '5', '9', '65', '140', '253', '79', '44', '156', '134', '242', '50', '36', '92', '86', '222', '232', '96', '136', '183', '186', '14', '73', '26', '207', '252', '3', '49', '92', '207', '120', '130', '252', '60', '56', '237', '224', '143', '119', '87', '253', '49', '120', '25', '100', '17', '52', '218', '41', '182', '250', '221', '72', '203', '4', '255', '242', '92', '74', '243', '157', '242', '241', '73', '90', '69', '209', '253', '250', '211', '83', '228', '53', '223', '111', '84', '127', '134', '140', '37', '104', '231', '23', '113', '221', '124', '34', '245', '174', '99', '234', '252', '57', '170', '175', '222', '18', '234', '154', '169', '29', '246', '101', '246', '243', '150', '162', '198', '18', '164', '223', '58', '105', '13', '162', '90', '6', '121', '99', '233', '154', '185', '21', '101', '60', '221', '68', '211', '61', '20', '138', '234', '233', '209', '101', '96', '249', '186', '150', '29', '57', '196', '120', '154', '152', '23', '46', '249', '148', '143', '44', '130', '192', '126', '187', '94', '86', '210', '241', '64', '89', '189', '46', '215', '238', '232', '242', '104', '166', '217', '21', '141', '37', '104', '242', '217', '155', '218', '102', '155', '146', '29', '229', '65', '148', '14', '202', '194', '180', '91', '93', '193', '88', '130', '202', '231', '23', '103', '168', '155', '255', '72', '127', '240', '101', '245', '45', '222', '150', '178', '34', '203', '124', '48', '97', '185', '255', '94', '212', '105', '125', '172', '70', '162', '221', '54', '126', '249', '50', '9', '36', '47', '92', '94', '5', '99', '111', '106', '58', '154', '158', '238', '54', '166', '170', '148', '91', '88', '130', '108', '133', '49', '252', '7', '146', '5', '69', '209', '29', '241', '166', '123', '114', '32', '245', '19', '9', '186', '72', '180', '155', '225', '24', '174', '38', '61', '197', '240', '202', '183', '7', '82', '207', '121', '20', '227', '159', '97', '151', '176', '111', '182', '209', '118', '158', '35', '251', '68', '84', '26', '241', '215', '18', '202', '188', '113', '201', '37', '15', '211', '203', '118', '11', '166', '98', '62', '30', '190', '193', '136', '158', '181', '189', '99', '212', '23', '124', '55', '242', '177', '24', '146', '225', '111', '86', '1', '247', '80', '40', '222', '53', '20', '4', '160', '32', '0', '5', '1', '40', '8', '64', '65', '0', '10', '2', '80', '16', '128', '130', '0', '20', '4', '160', '32', '0', '5', '1', '40', '8', '64', '65', '0', '10', '2', '80', '16', '128', '130', '0', '20', '4', '160', '32', '0', '5', '1', '40', '8', '64', '65', '0', '10', '2', '80', '16', '128', '130', '0', '20', '4', '160', '32', '0', '5', '1', '40', '8', '64', '65', '0', '10', '2', '80', '208', '69', '138', '226', '47', '36', '156', '148', '216', '28', '171', '42', '137', '0', '0', '0', '0', '73', '69', '78', '68', '174', '66', '96', '130'])
              if (buffer.compare(fileContent) == 0)
                done()
              else
                done("file content not correct")
            })
          })
        })
      })
    it("should open correctly archives with spaces and japanese characters in the file name", async () =>
    {
      const zipArchive = new ArchiveReader.ArchiveReader("test/this is a テスト.zip")
      const rarArchive = new ArchiveReader.ArchiveReader("test/this is a テスト.rar")
      return Promise.all([zipArchive.initialize(), rarArchive.initialize()])
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

describe("ComicLibrary", function ()
{
  if (fs.existsSync("test/library.db"))
    fs.unlinkSync("test/library.db")
  let library = new ComicLibrary("test/library.db")
  let testComicId = null
  it("should be able to save a new comic", () =>
  {
    return library
      .saveComic({
        path: "/fake/path/to/comic",
        title: "ＣＯＭＩＣ　ＴＩＴＬＥ",
        position: 10,
        zoom: 1.2
      })
      .then(comicId =>
      {
        assert.ok(comicId) // Check if it's not null
        testComicId = comicId
      })
  })
  it("shoud be able to load a previously saved comic", () =>
  {
    return library.loadComic(testComicId)
      .then(data => 
      {
        assert.strictEqual(data.path, "/fake/path/to/comic")
        assert.strictEqual(data.title, "ＣＯＭＩＣ　ＴＩＴＬＥ")
        assert.strictEqual(data.position, 10)
        assert.strictEqual(data.zoom, 1.2)
      })
  })
  it("should be able to update an existing comic", async () =>
  {
    await library.saveComic({ comicId: testComicId, position: 20 })
    const comic = await library.loadComic(testComicId)
    assert.deepEqual(comic.position, 20)
  })
})
