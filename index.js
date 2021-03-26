const express = require("express")
const app = new express()

app.use(express.json())

const port = 8080

const teams = {}

const field = []
const ships = []

const w = process.argv[2] || 10
const h = process.argv[3] || 10
const s = process.argv[4] || 10

const ShipCheck = (field, ship) => {
    const x = ship.x
    const y = ship.y
    if (ship.vertical) {
        for (let i = 0; i < ship.maxHp; i++) {
            if (!field[y + i] || !field[y + i][x] || field[y + i][x].ship) {
                return false
            }
        }
    } else {
        for (let i = 0; i < ship.maxHp; i++) {
            if (!field[y] || !field[y][x + i] || field[y][x + i].ship) { 
                return false
            }
        }
    }
    return true
}


for (let y = 0; y < h; y++) {
    const row =  []
    for (let x = 0; x < w; x++) {
        row.push({
            team: null,
            x,
            y,
            ship: null,
            shipId: null,
            hit: false
        })
    }
    field.push(row)
}


let count = 0
while (count < s) {
    const x = Math.floor(Math.random() * w) 
    const y = Math.floor(Math.random() * h)
    const maxHp = Math.floor(Math.random() * (6 - 2)) + 2 
    const vertical = Math.random() < 0.5
    const ship = {
        id: count,
        x,
        y,
        vertical,
        maxHp,
        curHp: maxHp,
        alive: true,
        killer: null
    }
    
    if (ShipCheck(field, ship)) {
        ships.push(ship)
        for (let e = 0; e < ship.maxHp; e ++) {
            const x = ship.vertical ? ship.x : ship.x + e
            const y = ship.vertical ? ship.y + e : ship.y
            field[y][x].ship = ship
            field[y][x].shipId = count
        }
        count ++
    }
}

app.get("/", ({ query: { format } }, res) => {
    const visibleField = field.map(row => row.map(cell => (
        {
            team: cell.team,
            x: cell.x,
            y: cell.y,
            hit: cell.hit,
            ship: cell.hit ? cell.ship ? { id: cell.shipId, alive: cell.ship.alive, killer: cell.ship.killer } : null : null
        }
    )))
    if (format === "json") {
        res.json({ visibleField })
    } else {
        res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>battaglia navale</title>
                <style>
                    table, td, th {
                        border: 1px solid black;
                    }
                    
                    table {
                        width: 50%;
                        border-collapse: collapse;
                    }
                </style>
            </head>
            <body>
                <table>
                    <tbody>
                        ${field.map(row => `<tr>${row.map(cell => `<td>${cell.ship ? cell.ship.id : "acqua"}</td>`).join("")}</tr>`).join("")}
                    </tbody>
                </table>
            </body>
        </html>
        `)
    }
})

app.post("/signup", ({ body: { team, password } }, res) => {
    if (typeof team !== "string" || typeof password !== "string" || !team || !password) {
        return res.status(400).send({ msg: "Password e team devono essere stringhe e non nulle" })
    }
    if (teams[team]) {
        res.status(400).send({ msg: `hai già effettuato l'accreditamento con il nome:  ${team}` })
    } else {
        teams[team] = {
            team, password, score: 0, killedShips: [], firedBullets: 0, lastFiredBullet: new Date().getTime()
        }
        res.status(200).send({ msg: "Accreditamento riuscito!", credentials: { team, password } })
    }
})

app.post("/fire", ({ body: { x, y, team, password } }, res) => {
    if (teams[team].password === password) {
        if (x > w || y > h || x < 0 || y < 0) {
            teams[team].score -= 20
            return res.status(400).send({ score: teams[team].score, msg: "Sei uscito dal campo!" })
        }
        
        const cell = field[y][x]
        
        if (cell.ship && !cell.hit) {
            cell.hit = true
            if (cell.ship.curHp === 1) {
                cell.ship.alive = false
                cell.ship.curHp = 0
                cell.ship.killer = team
                teams[team].killedShips.push(cell.ship)
                teams[team].score += 3
                return res.status(200).send({ score: teams[team].score, info: { x, y, team }, msg: "nave affondata" })
            } else {
                cell.ship.killer = team
                cell.ship.curHp -= 1
                teams[team].killedShips.push(cell.ship)
                teams[team].score += 1
                
                return res.status(200).send({ score: teams[team].score, info: { x, y, team }, msg: "nave colpita ma non affondata" })
            }
            
        } else if (cell.hit) {
            teams[team].score -= 2
            res.status(400).send({ score: teams[team].score, info: { x, y, team }, msg: "cella già colpita" })
        } else {
            cell.hit = true
            res.status(200).send({ score: teams[team].score, info: { x, y, team }, msg: "acqua" })
        }
    } else {
        res.status(401).json({msg: "Password/Team errati"})
    }
})

app.listen(port, () => console.log("Listening on port", port))