const mineflayer = require('mineflayer');
const config = require('./config.json');
const { performance } = require('perf_hooks');
const fs = require('fs');
const Vec3 = require('vec3').Vec3;
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals
const schem = require('./data.json');
const mcData = require('minecraft-data')(1.8)
const Item = require('prismarine-item')('1.8');

let bot = mineflayer.createBot({
    host: config.ServerIP,
    username: config.Username,
    version: 1.8,
    viewDistance: "tiny"
});

bot.loadPlugin(pathfinder)
bot.on('login', () => {
    console.log(`${config.Username} logged in ${config.ServerIP}!`)
})
bot.on('chat', function (username, message) {

    if (username === bot.username) return
    let allblocks = [];
    let currentlayer = [];
    let keys = [];
    let goalreached = [];
    let startX = Math.floor(bot.player.entity.position.x);
    let startY = Math.floor(bot.player.entity.position.y);
    let startZ = Math.floor(bot.player.entity.position.z);
    if (message === 'print') {
        let startTime = performance.now();
        for (const key in schem) {
            if (schem.hasOwnProperty(key)) {
                schem[key].forEach(element => {
                    allblocks.push(element);
                });
            }
            keys.push(key)
        }
        runLayer();
        function runLayer() {
            //console.log('running layer')
            if(!schem[keys[0]]){
                let time = (performance.now() - startTime).toFixed(3);
                console.log(`Finished printing in ${time}ms!`)
                return;
            } else {
            schem[keys[0]].forEach(element => {
                currentlayer.push(element);
            })
        }
            runQueue();
        }
        function nearbyBlocks(position) {
            function difference(a, b) { return Math.abs(a - b); }
            let nearbyBlocks = [];
            allblocks.forEach(element => {
                //Less than range -0.5 away
                if (difference(element.coords.x + startX, position.x) < config.Range - 0.5 && difference(element.coords.y + startY, position.y) < config.Range - 0.5 && difference(element.coords.z + startZ, position.z) < config.Range - 0.5) {
                    nearbyBlocks.push(element);
                }
            })
            return nearbyBlocks;
        }
        function nearbyBlocksLayer(position) {
            function difference(a, b) { return Math.abs(a - b); }
            let nearbyBlocksLayer = [];
            currentlayer.forEach(element => {
                //Less than range -0.5 away
               if (difference(element.coords.x + startX, position.x) < config.Range - 0.5 && difference(element.coords.y + startY, position.y) < config.Range - 0.5 && difference(element.coords.z + startZ, position.z) < config.Range - 0.5) {
                    nearbyBlocksLayer.push(element);
                }
            })
            return nearbyBlocksLayer;
        }
        let queue = false;
        function runQueue() {
            //console.log('running queue')
            let nearbyblock =  nearbyBlocks(bot.player.entity.position);
            let nearbylayer =  nearbyBlocksLayer(bot.player.entity.position);
            //If no blocks nearby walk to it
            if (nearbyblock < 1 || nearbylayer < 1) {
                goalreached = [];
                
                const defaultMove = new Movements(bot, mcData)

                bot.pathfinder.setMovements(defaultMove)
                if(currentlayer.length < 1){keys.shift(); runLayer();return;}
                bot.pathfinder.setGoal(new GoalBlock(currentlayer[0].coords.x + startX - 1, currentlayer[0].coords.y + startY + 1, currentlayer[0].coords.z + startZ))
                bot.on('goal_reached', () => {
                    if(goalreached.length < 1){
                        runQueue(); 
                    }
                })
            } else {
                goalreached.push('yes');
                let index = 0;
                let timer = setInterval(() => {
                    if(currentlayer.length < 1){clearInterval(timer);keys.shift();runLayer();return;}
                    if (index === nearbylayer.length) { clearInterval(timer);runQueue(); return; }
                    if (queue) { return; }
                    runBlock(nearbylayer[index]);
                    index++;
                }, config.blockDelay);
            }

        }
        function runBlock(block) {
            // if(block.type === 23){
            //     currentlayer = currentlayer.filter(element => element != block);
            //     allblocks = allblocks.filter(element => element != block);
            //     queue = false
            //     return;
            // }
            queue = true;
            const CurrentItem = new Item(block.type, 64);
            bot.creative.setInventorySlot(36, CurrentItem);
            bot.creative.setInventorySlot(37, CurrentItem);
            bot.creative.setInventorySlot(38, CurrentItem);
            bot.creative.setInventorySlot(39, CurrentItem);
            bot.creative.setInventorySlot(40, CurrentItem);
            bot.creative.setInventorySlot(41, CurrentItem);
            bot.creative.setInventorySlot(42, CurrentItem);
            bot.creative.setInventorySlot(43, CurrentItem);
            bot.creative.setInventorySlot(44, CurrentItem);

            //Find block to place off
            //console.log(new Vec3(block.coords.x + startX, block.coords.y + startY, block.coords.z + startZ))
            let down = bot.blockAt(new Vec3(block.coords.x + startX, block.coords.y + startY - 1, block.coords.z + startZ))
            let up = bot.blockAt(new Vec3(block.coords.x + startX, block.coords.y + startY + 1, block.coords.z + startZ))
            let north = bot.blockAt(new Vec3(block.coords.x + startX, block.coords.y + startY, block.coords.z + startZ + 1))
            let south = bot.blockAt(new Vec3(block.coords.x + startX, block.coords.y + startY, block.coords.z + startZ - 1))
            let west = bot.blockAt(new Vec3(block.coords.x + startX - 1, block.coords.y + startY, block.coords.z + startZ))
            let east = bot.blockAt(new Vec3(block.coords.x + startX + 1, block.coords.y + startY, block.coords.z + startZ))
            switch (true) {
                case north != null && north.name != 'air':
                    //console.log('north')
                    // bot.lookAt(new Vec3(south.position.x+startX,south.position.y+startY,south.position.z+startZ),true,()=>{
                    bot.placeBlock(north, new Vec3(0, 0, -1), () => {
                        currentlayer = currentlayer.filter(element => element != block);
                        allblocks = allblocks.filter(element => element != block);
                        queue = false
                    });
                    //  });
                    break;
                case south != null && south.name != 'air':
                    //console.log('south')
                    // bot.lookAt(new Vec3(south.position.x+startX,south.position.y+startY,south.position.z+startZ),true,()=>{
                    bot.placeBlock(south, new Vec3(0, 0, 1), () => {
                        currentlayer = currentlayer.filter(element => element != block);
                        allblocks = allblocks.filter(element => element != block);
                        queue = false
                    });
                    //  });
                    break;
                case west != null && west.name != 'air':
                    //console.log('west')
                    // bot.lookAt(new Vec3(west.position.x+startX,west.position.y+startY,west.position.z+startZ),true,()=>{
                    bot.placeBlock(west, new Vec3(1, 0, 0), () => {
                        currentlayer = currentlayer.filter(element => element != block);
                        allblocks = allblocks.filter(element => element != block);
                        queue = false
                    });
                    //   });
                    break;
                case east != null && east.name != 'air':
                    //console.log('east')
                    // bot.lookAt(new Vec3(east.position.x+startX,east.position.y+startY,east.position.z+startZ),true,()=>{
                    bot.placeBlock(east, new Vec3(-1, 0, 0), () => {
                        currentlayer = currentlayer.filter(element => element != block);
                        allblocks = allblocks.filter(element => element != block);
                        queue = false
                    });
                    //  });
                    break;
                case down != null && down.name != 'air':
                    //console.log('down')
                    //bot.lookAt(new Vec3(down.position.x+startX,down.position.y+startY,down.position.z+startZ),true,()=>{
                    bot.placeBlock(down, new Vec3(0, 1, 0), () => {
                        currentlayer = currentlayer.filter(element => element != block);
                        allblocks = allblocks.filter(element => element != block);
                        queue = false
                    });
                    //})
                    break;
                case up != null && up.name != 'air':
                    //console.log('up')
                    //bot.lookAt(new Vec3(up.position.x+startX,up.position.y+startY,up.position.z+startZ),true,()=>{
                    bot.placeBlock(up, new Vec3(0, -1, 0), () => {
                        currentlayer = currentlayer.filter(element => element != block);
                        allblocks = allblocks.filter(element => element != block);
                        queue = false
                    });
                    //   })
                    break;
                    
            }

        }
    }
})
