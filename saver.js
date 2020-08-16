const mineflayer = require('mineflayer');
const config = require('./config.json');
const { performance } = require('perf_hooks');
const fs = require('fs');
const Vec3 = require('vec3').Vec3;

let bot = mineflayer.createBot({
    host: config.ServerIP,
    username: config.Username,
    version: 1.8,
    viewDistance: "tiny"
});

bot.on('login', () => {
    console.log(`Logged in ${config.Username} on ${config.ServerIP}!`);
})
bot.on('chat', function (username, message) {

    if (username === bot.username) return

    if (message === 'save') {
        let locations = [];
        let startTime = performance.now();
        //Handle locations
        if (config.StartBox.x > config.EndBox.x) {
            for (let iX = config.StartBox.x; iX > config.EndBox.x - 1; iX--) {
                if (config.StartBox.y > config.EndBox.y) {
                    for (let iY = config.StartBox.y; iY > config.EndBox.y - 1; iY--) {
                        if (config.StartBox.z > config.EndBox.z) {
                            for (let iZ = config.StartBox.z; iZ > config.EndBox.z - 1; iZ--) {
                                locations.push(new Vec3(Math.floor(iX), Math.floor(iY), Math.floor(iZ)));
                            }
                        } else {
                            for (let iZ = config.StartBox.z; iZ < config.EndBox.z + 1; iZ++) {
                                locations.push(new Vec3(Math.floor(iX), Math.floor(iY), Math.floor(iZ)));
                            }
                        }
                    }
                } else {
                    for (let iY = config.StartBox.y; iY < config.EndBox.y + 1; iY++) {
                        if (config.StartBox.z > config.EndBox.z) {
                            for (let iZ = config.StartBox.z; iZ > config.EndBox.z - 1; iZ--) {
                                locations.push(new Vec3(Math.floor(iX), Math.floor(iY), Math.floor(iZ)));
                            }
                        } else {
                            for (let iZ = config.StartBox.z; iZ < config.EndBox.z + 1; iZ++) {
                                locations.push(new Vec3(Math.floor(iX), Math.floor(iY), Math.floor(iZ)));
                            }
                        }
                    }
                }
            }
        } else {
            for (let iX = config.StartBox.x; iX < config.EndBox.x + 1; iX++) {
                if (config.StartBox.y > config.EndBox.y) {
                    for (let iY = config.StartBox.y; iY > config.EndBox.y - 1; iY--) {
                        if (config.StartBox.z > config.EndBox.z) {
                            for (let iZ = config.StartBox.z; iZ > config.EndBox.z - 1; iZ--) {
                                locations.push(new Vec3(Math.floor(iX), Math.floor(iY), Math.floor(iZ)));
                            }
                        } else {
                            for (let iZ = config.StartBox.z; iZ < config.EndBox.z + 1; iZ++) {
                                locations.push(new Vec3(Math.floor(iX), Math.floor(iY), Math.floor(iZ)));
                            }
                        }
                    }
                } else {
                    for (let iY = config.StartBox.y; iY < config.EndBox.y + 1; iY++) {
                        if (config.StartBox.z > config.EndBox.z) {
                            for (let iZ = config.StartBox.z; iZ > config.EndBox.z - 1; iZ--) {
                                locations.push(new Vec3(Math.floor(iX), Math.floor(iY), Math.floor(iZ)));
                            }
                        } else {
                            for (let iZ = config.StartBox.z; iZ < config.EndBox.z + 1; iZ++) {
                                locations.push(new Vec3(Math.floor(iX), Math.floor(iY), Math.floor(iZ)));
                            }
                        }
                    }
                }
            }
        }
        let savedata = {};
        if (config.StartBox.y > config.EndBox.y) {
            for (let iY = config.StartBox.y; iY > config.EndBox.y - 1; iY--) {
                savedata[iY] = [];
            }
        }
        else {
            for (let iY = config.StartBox.y; iY < config.EndBox.y + 1; iY++) {
                savedata[iY] = [];
            }
        }
        locations.forEach(location => {
            let blockinfo = bot.blockAt(location);
            if (blockinfo.displayName && blockinfo.displayName != 'Air') {
                savedata[blockinfo.position.y].push({
                    coords: {
                        x: blockinfo.position.x - Math.floor(bot.player.entity.position.x),
                        y: blockinfo.position.y - Math.floor(bot.player.entity.position.y),
                        z: blockinfo.position.z - Math.floor(bot.player.entity.position.z)
                    },
                    type: blockinfo.type,
                    metadata: blockinfo.metadata,
                    stateId: blockinfo.stateId,
                    name: blockinfo.name,
                    displayName: blockinfo.displayName
                })
            }
        })
        let data = JSON.stringify(savedata);
        fs.writeFileSync(config.SchematicName, data);
        let time = (performance.now() - startTime).toFixed(3);
        console.log(`Area saved in ${time}ms!`)
    }
});