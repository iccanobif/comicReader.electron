const sqlite = require("sqlite")
const uuid = require("uuid/v1")

module.exports.ComicLibrary =
    class ComicLibrary
    {
        constructor(dbPath)
        {
            this.dbPath = dbPath
            this.initialized = false
        }

        async getDb()
        {
            return new Promise(async (resolve, reject) =>
            {
                try
                {
                    const db = await sqlite.open(this.dbPath)
                    if (!this.initialized)
                    {
                        await db.exec(`CREATE TABLE IF NOT EXISTS COMICS (
                            GBL_ID primary key,
                            PATH,
                            TITLE,
                            POSITION,
                            CREATION_DATE,
                            LAST_EDIT_DATE,
                            ZOOM)`)
                        await db.exec(`CREATE TABLE IF NOT EXISTS COMICS_LOG (
                                GBL_ID,
                                PATH,
                                TITLE,
                                POSITION,
                                CREATION_DATE,
                                OPERATION_TYPE,
                                OPERATION_DATE,
                                ZOOM)`)
                        this.initialized = true
                    }

                    resolve(db)
                }
                catch (error)
                {
                    reject(error)
                }
            })
        }

        async getComicList(filter)
        {
            return new Promise(async (resolve, reject) =>
            {
                try
                {
                    const db = await this.getDb()
                    resolve(await db.all(`select gbl_id as id, 
                                                 path as path, 
                                                 title as title, 
                                                 position as position, 
                                                 zoom as zoom 
                                                 from comics 
                                                 where upper(title) like ?`, "%" + filter.toUpperCase() + "%"))
                }
                catch (error)
                {
                    reject(error)
                }
            })
        }

        loadComic(comicId)
        {
            return new Promise(async (resolve, reject) =>
            {
                try
                {
                    const db = await this.getDb()
                    resolve(await db.get(`select gbl_id as id, 
                                                 path as path, 
                                                 title as title, 
                                                 position as position, 
                                                 zoom as zoom 
                                                 from comics 
                                                 where gbl_id = ?`, comicId))
                }
                catch (error)
                {
                    reject(error)
                }
            })
        }

        async saveComic(data)
        {
            // If the data object has an "id" attribute an UPDATE will be performed, otherwise it'll be an INSERT

            return new Promise(async (resolve, reject) =>
            {
                try
                {
                    const db = await this.getDb()
                    let comicId = data.comicId ? data.comicId : uuid()

                    await db.run(`INSERT INTO COMICS (
                                                GBL_ID, 
                                                PATH, 
                                                TITLE, 
                                                POSITION, 
                                                CREATION_DATE, 
                                                ZOOM) 
                                            VALUES (
                                                $gbl_id, 
                                                $path, 
                                                $title, 
                                                $position, 
                                                $time, 
                                                $zoom) 
                                            ON CONFLICT (GBL_ID) 
                                            DO UPDATE SET
                                                PATH = IFNULL($path, PATH),
                                                TITLE = IFNULL($title, TITLE),
                                                POSITION = IFNULL($position, POSITION),
                                                LAST_EDIT_DATE = $time,
                                                ZOOM = IFNULL($zoom, ZOOM)
                                                `,
                        {
                            $gbl_id: comicId,
                            $path: data.path,
                            $title: data.title,
                            $position: data.position,
                            $time: "data di oggi",
                            $zoom: data.zoom
                        }
                    )

                    resolve(comicId)
                }
                catch (error)
                {
                    reject(error)
                }
            })
        }
    }