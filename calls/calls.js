/*const express = require("express")
const app = new express()
const fetch = require("node-fetch")
const port = 8000


const team = "I megasgherri"
const password = "Goblin cerebottaniere"

const login = () => {
    fetch("http://localhost:8080/signup", {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ team, password })
    })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error(err))
}

const attack = () => {
    fetch("http://localhost:8080/?format=json")
    .then(response => response.json())
    .then(data => {
        const field = data.visibleField.map(row => row.filter(cell => !cell.hit)).filter(row => row.length > 0)
        const y = Math.floor(Math.random() * field.length)
        const x = Math.floor(Math.random() * field[y].length)
        const cell = field[y][x]
        
        fetch("http://localhost:8080/fire", {
            headers: {
              "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({x : cell.x, y: cell.y, team, password})
          })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err))

    }).catch(err => console.log(err))
}

login()
setInterval(attack, 1000)

app.listen(port, () => console.log(`app listening on port ${port}`))*/

const express = require("express")
const app = new express
const fetch = require("node-fetch")

const port = 8000

const url = "localhost:8080"
//"93.42.249.207:8080"


const username = "pippo"
const password = "ciao"

const getConditions = (field, cell) => {
  const upCondition = cell.y > 0 && !field[cell.y - 1][cell.x].hit
  const downCondition = cell.y < field.length - 1 && !field[cell.y + 1][cell.x].hit
  const leftCondition = cell.x > 0 && !field[cell.y][cell.x - 1].hit
  const rightCondition = cell.x < field[cell.y].length - 1 && !field[cell.y][cell.x + 1].hit
  return { upCondition, downCondition, leftCondition, rightCondition }
}

const login = async() => {
  try {
    let res = await fetch(`http://${url}/signup?team=${username}&password=${password}`)
    res = await res.status
    console.log(res)
  } catch (err) {
    console.error(err)
  }
}

const hit = async(cell = null, dir = null) => {
  let points

  const { gameStatus, completeField, field } = await getField()

  if (!gameStatus) {
    return { msg: "Tutte le caselle sono state colpite" }
  }

  if (!cell) {
    const data = getCasualCell(field, completeField)
    cell = data.cell
    dir = data.dir
  }

  try {
    const res = await fetch(`http://${url}/fire?x=${cell.x}&y=${cell.y}&team=${username}&password=${password}`)
    const data = await res.ok ? res.json() : res.status
    if (res.ok) {
      points = data.score
      console.log(await data)

      const { upCondition, downCondition, leftCondition, rightCondition } = getConditions(completeField, cell)
      if (points === 1) {
        if (dir === "up" && upCondition) {
          setTimeout(hit, 1001, completeField[cell.y - 1][cell.x], "up")
        } else if (dir === "down" && downCondition) {
          setTimeout(hit, 1001, completeField[cell.y + 1][cell.x], "down")
        } else if (dir === "left" && leftCondition) {
          setTimeout(hit, 1001, completeField[cell.y][cell.x - 1], "left")
        } else if (dir === "right" && rightCondition) {
          setTimeout(hit, 1001, completeField[cell.y][cell.x + 1], "right")
        } else {
          setTimeout(hit, 1001)
        }
      } else if (points === 0) {
        if (dir === "up") {
          const alive = completeField[cell.y + 1][cell.x].ship ? completeField[cell.y + 1][cell.x].ship.alive : false
          if (alive) {
            let newCell = null
            let y = 1
            while (!newCell) {
              newCell = completeField[cell.y + y] ?
                completeField[cell.y + y][cell.x].hit ? null : completeField[cell.y + y][cell.x] : null
              if (cell.y + y >= completeField.length) {
                break
              }
              y ++
            }
            if (!newCell) {
              setTimeout(hit, 1001)
            } else {
              const condition = getConditions(completeField, newCell).downCondition
              condition ? setTimeout(hit, 1001, newCell, "down") : setTimeout(hit, 1001)
            }
          } else {
            setTimeout(hit, 1001)
          }
        } else if (dir === "down") {
          const alive = completeField[cell.y - 1][cell.x].ship ? completeField[cell.y - 1][cell.x].ship.alive : false
          if (alive) {
            let newCell = null
            let y = 1
            while (!newCell) {
              newCell = completeField[cell.y - y] ?
                completeField[cell.y][cell.x].hit ? null : completeField[cell.y - y][cell.x] : null
              if (cell.y - y < 0) {
                break
              }
              y ++
            }
            if (!newCell) {
              setTimeout(hit, 1001)
            } else {
              const condition = getConditions(completeField, newCell).upCondition
              condition ? setTimeout(hit, 1001, newCell, "up") : setTimeout(hit, 1001)
            }
          } else {
            setTimeout(hit, 1001)
          }
        } else if (dir === "left") {
          const alive = completeField[cell.y][cell.x + 1].ship ? completeField[cell.y][cell.x + 1].ship.alive : false
          if (alive) {
            let newCell = null
            let x = 1
            while (!newCell) {
              newCell = completeField[cell.y][cell.x + x] ?
                completeField[cell.y][cell.x + x].hit ? null : completeField[cell.y][cell.x + x] : null
              if (cell.x + x >= completeField[cell.y].length) {
                break
              }
              x ++
            }
            if (!newCell) {
              setTimeout(hit, 1001)
            } else {
              const condition = getConditions(completeField, newCell).rightCondition
              condition ? setTimeout(hit, 1001, newCell, "right") : setTimeout(hit, 1001)
            }
          } else {
            setTimeout(hit, 1001)
          }
        } else if (dir === "right") {
          const alive = completeField[cell.y][cell.x - 1].ship ? completeField[cell.y][cell.x - 1].ship.alive : false
          if (alive) {
            let newCell = null
            let x = 1
            while (!newCell) {
              newCell = completeField[cell.y][cell.x - x] ?
                completeField[cell.y][cell.x - x].hit ? null : completeField[cell.y][cell.x - x] : null
              if (cell.x - x < 0) {
                break
              }
              x ++
            }
            if (!newCell) {
              setTimeout(hit, 1001)
            } else {
              const condition = getConditions(completeField, newCell).leftCondition
              condition ? setTimeout(hit, 1001, newCell, "left") : setTimeout(hit, 1001)
            }
          } else {
            setTimeout(hit, 1001)
          }
        } else {
          setTimeout(hit, 1001)
        }
      } else {
        setTimeout(hit, 1001)
      }
    } else {
      console.log(data)
    }
  } catch (err) {
    console.error(err)
  }
  return points
}

const getCasualCell = (field, completeField) => {
  let cellShip = completeField.map(row => row.filter(e => e.ship)).filter(e => e.length > 0).flat()
  cellShip = cellShip.filter(cell => cell.ship.alive)
  let cell, dir
  cellShip.forEach(e => {
    if (e) {
      const { upCondition, downCondition, leftCondition, rightCondition } = getConditions(completeField, e)

      let count = 0
      while (true) {
        const directionList = ["up", "down", "left", "right"]
        const direction = directionList[Math.floor(Math.random() * directionList.length)]

        if (upCondition && direction === "up") {
          cell = completeField[e.y - 1][e.x]
          dir = direction
          break
        } else if (downCondition && direction === "down") {
          cell = completeField[e.y + 1][e.x]
          dir = direction
          break
        } else if (leftCondition && direction === "left") {
          cell = completeField[e.y][e.x - 1]
          dir = direction
          break
        } else if (rightCondition && direction === "right") {
          cell = completeField[e.y][e.x + 1]
          dir = direction
          break
        } else if (count > 20) {
          break
        }
        count ++
      }
      if (cell) {
        return cell
      }
    }
  })
  if (!cell) {
    const yrandom = Math.floor(Math.random() * field.length)
    const xrandom = Math.floor(Math.random() * field[yrandom].length)
    cell = field[yrandom][xrandom]
    dir = null
  }
  return { cell, dir }
}

const getField = async() => {
  let completeField

  try {
    let res = await fetch(`http://${url}/?format=json`)
    res = await res.json()
    completeField = res.field
  } catch (err) {
    console.error(err)
  }

  const tempField = completeField.map(row => row.filter(cell => !cell.hit))
  const field = tempField.filter(row => row.length > 0)
  const gameStatus = !tempField.every(row => row.every(cell => !cell))

  if (gameStatus) {
    return { gameStatus, completeField, field }
  } else {
    return { gameStatus }
  }
}

login()
hit()

app.listen(port, () => console.log("Listening on port", port))