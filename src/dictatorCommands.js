// file: contains all of the dictator commands
const dictatorCmds = require("./dictatorUtil")



function execCommand(cmd,message){
    if(cmd == "deploy") dictatorCmds.deploy(message);
}






module.exports = {execCommand}