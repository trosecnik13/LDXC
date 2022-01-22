const http = require('http');
var CryptoJS = require("crypto-js");
const Database = require("easy-json-database");
const db_hashes = new Database("../hashes.json", {
    snapshots: {
        enabled: false,
        folder: './backups/'
    }
});
const db_wallets = new Database("../wallets.json", {
  snapshots: {
      enabled: false,
      folder: './backups/'
  }
});
const db_wallets_balance = new Database("../wallets_balance.json", {
  snapshots: {
      enabled: true,
      interval: 24 * 60 * 60 * 1000,
      folder: './backups/'
  }
});
const db_discord_connection = new Database("../discord_connection.json", {
  snapshots: {
      enabled: true,
      folder: './backups/'
  }
});

const requestListener = function (req, res) {
  console.log(req.url)

  if (req.url == '/request_hash') { 
    var rand = Math.random().toString(16).substr(2, 12);
    db_hashes.set(`${rand}`, 0);

    res.writeHead(200);
    res.end(`${rand}`);
    console.log(`Odeslana odpoved: ${rand}`)
  }
  else if ((req.url).startsWith("/request_balance")) {
    var balance_wallet = (req.url).split(";")
    var current_balance = db_wallets_balance.get(balance_wallet[1])

    res.writeHead(200);
    res.end(`${current_balance}`);
    console.log(current_balance);
  }
  else if ((req.url).startsWith("/discord")) {
    var rozdeleni = (req.url).split(";")
    var wallet = rozdeleni[1]
    var password = rozdeleni[2]
    var discord_id = rozdeleni[3]

    if (db_discord_connection.get(discord_id) === undefined) {
      db_discord_connection.set(discord_id, wallet)
      res.writeHead(200);
      res.end("Discord úspěšně propojen s peněženkou");       
    }
    else {
      res.writeHead(200);
      res.end("Toto Discord ID je již propojené!");     
    }
  }
  else if ((req.url).startsWith("/send")) {
    var rozdeleni = (req.url).split(";") 
    var wallet = rozdeleni[1]
    var password = rozdeleni[2]
    var how_much = parseInt(rozdeleni[3])
    var to_whom = rozdeleni[4]

    if (db_wallets.get(wallet) === password) {
      if (db_wallets_balance.get(wallet) < how_much) {
        res.writeHead(200);
        res.end("Něco se posralo!");
      }
      else {
        if (db_wallets_balance.get(to_whom) === undefined) {
          res.writeHead(200);
          res.end("Něco se posralo!");
        }
        else {
          db_wallets_balance.set(wallet, db_wallets_balance.get(wallet) - how_much)
          db_wallets_balance.set(to_whom, db_wallets_balance.get(to_whom) + how_much)

          res.writeHead(200);
          res.end(`Úspěšně odesláno ${how_much} ludixcoinů do ${to_whom} peněženky`);
        }
      }
    }
    else {
      res.writeHead(200);
      res.end("Něco se posralo!");
    }
  }
  else if (req.url === undefined || req.url === "/") {
    console.log("undefined")
  }
  else if ((req.url).startsWith("/request_new_wallet")) {
    var kokot = (req.url).split(";")
    var new_wallet = kokot[1]
    var new_password = kokot[2]

    if (db_wallets.get(new_wallet) === undefined) {
      db_wallets.set(new_wallet, new_password)
      db_wallets_balance.set(new_wallet, 0)

      res.writeHead(200);
      res.end(`Wallet úspěšně založena!`);
    }
    else {
      res.writeHead(200);
      res.end(`Tato wallet již existuje!`);
    }
  }
  else {
    if ((req.url).startsWith("/login")) {
      var login = (req.url).split(";")
      var login_wallet = login[1]
      var login_password = login[2]
      if (db_wallets.get(login_wallet) === login_password) {
        res.writeHead(200);
        res.end("cool");
      }
      else {
        res.writeHead(200);
        res.end("notcool");
      }
    }
    else {
      if ((req.url).startsWith("/verification")) {
        var rozdeleni = (req.url).split(";") 
        var wallet = rozdeleni[1]
        var password = rozdeleni[2]
        var hash = rozdeleni[3]
        var nonce = rozdeleni[4]

        if (db_hashes.get(hash) !== undefined || db_hashes.get(hash) !== 1) {
          if ((CryptoJS.SHA256(hash + ":" + nonce).toString()).startsWith("00000")) {
            console.log("Hash úspěšně ověřen!");
            db_hashes.set(hash, 1);

            if (db_wallets.get(wallet) === password) {
              if (db_wallets_balance.get(wallet) === undefined) {db_wallets_balance.set(wallet, 1)}
              else {db_wallets_balance.set(wallet, db_wallets_balance.get(wallet) + 1)}

              res.writeHead(200);
              res.end("\x1b[32m" + "Hash uspesne overen, pricten 1 LudixCoin!" + "\x1b[0m");
              console.log("Hash úspěšně ověřen, přičten 1 LudixCoin!");
            }
            else {
              res.writeHead(200);
              res.end("Hash nebyl úspěšně ověřen!");
              console.log("Hash nebyl úspěšně ověřen!");
            }
          }
          else {
            res.writeHead(200);
            res.end("Hash nebyl úspěšně ověřen!");
            console.log("Hash nebyl úspěšně ověřen!");
          }
        }
        else {
          res.writeHead(200);
          res.end(`False requested url!`);
          console.log(`False requested url!`);
        }
      }
      else {
        console.log("demente")
      }
    }
  }
}

const server = http.createServer(requestListener);
server.listen(8080);
