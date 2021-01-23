
const date = new Date();


let rotated_today = false;
let previous_day = date.getDay();
let current_day = date.getDay();
setInterval(()=>{
    const hour = date.getHours();
    console.log(hour)

    if(rotated_today && previous_day != current_day){
        previous_day = current_day;
        rotated_today = false;
    }

    if(hour == 12 && !rotated_today){
        console.log('current day:',current_day,"previous day:",previous_day)
        console.log('ROTATING DICTATOR')
        rotated_today = true;
    }

},1000);


setInterval(()=>{current_day += 1},5000)