const express = require("express")
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
setInterval(attack,1000)

app.listen(port, () => console.log(`app listening on port ${port}`))