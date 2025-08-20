var statustext = 0;
var latitude = 0;
var longitude = 0;
var nearestStation = "";
var timeMargin = 60; //60초 이전 도착시각 표시
var refreshInterval = 1000;
var timer = 0;


function initialize() {
  statustext = document.getElementById("statustext");
  changeDay();
  getLocation();
  document.getElementById("autorefresh").checked = true;
  autoRefresh();
}

function getLocation() {
    if (!navigator.geolocation){
        statustext.innerHTML = "위치 기능이 현재 브라우저에서 동작하지 않습니다.";
    } else {
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

function success(position) {
    latitude = Number(position.coords.latitude);
    longitude = Number(position.coords.longitude);

    getDistanceFromStations();
    printNearestStation();
    statustext.innerHTML = "가장 가까운 역: " + nearestStation;
    generateTable();
    
    
}

function error(){
    statustext.innerHTML = "위치 정보를 찾을 수 없습니다."
}

function getDistanceFromStations(){
    for (var key1 in line1pos){
            line1pos[key1]["거리"] = calculateDistance(line1pos[key1]["역위도"] - latitude, line1pos[key1]["역경도"] - longitude);
    }
    for (var key1 in line2pos){
            line2pos[key1]["거리"] = calculateDistance(line2pos[key1]["역위도"] - latitude, line2pos[key1]["역경도"] - longitude);
    }
    for (var key1 in line3pos){
            line3pos[key1]["거리"] = calculateDistance(line3pos[key1]["역위도"] - latitude, line3pos[key1]["역경도"] - longitude);
    }

}

function calculateDistance(lat_diff, longtitude_diff){
    return (lat_diff**2 + longtitude_diff**2)**0.5
}

function printNearestStation(){
    let temparray = [];
    let selbox = document.getElementById("staction-select");
    
   temparray =  temparray.concat(line1pos,line2pos,line3pos);
        temparray.sort(function(a,b){
        return a["거리"] - b["거리"];
    });
    
    selbox.value = temparray[0]["역사명"];
    nearestStation = temparray[0]["역사명"];
    secondStation = document.getElementById("second_station");
    thirdStation = document.getElementById("third_station");
    
    secondStation.innerHTML = temparray[1]["역사명"];
    thirdStation.innerHTML = temparray[2]["역사명"];
    
    getTimetable(nearestStation);
}

function changeStationSelectionBox(obj){
    document.getElementById("staction-select").value = obj.innerHTML;
    getTimetable(obj.innerHTML);

}

function changeDay(){
    let today = new Date();
    if (today.getDay() == 0 ){
        document.getElementById("weekday").innerHTML = "일요일";
    } else if (today.getDay() == 6){
        document.getElementById("weekday").innerHTML = "토요일";
    } else {
        document.getElementById("weekday").innerHTML = "평일";
    }
}

function getTimetable(value){
    const regex = /\(.*\)/i;
    const filtteredtext = value.replace(regex, "");
    let uptrainForm = document.getElementById("uptrain");
    let downtrainForm = document.getElementById("downtrain");
    let weekdaySelection = document.getElementById("weekday");
    var loadfileup;
    var loadfiledown;
    
    if (weekdaySelection.innerHTML == "일요일"){
        loadfileup = line2upsunday;
        loadfiledown = line2downsunday;
    } else if (weekdaySelection.innerHTML == "토요일"){
        loadfileup = line2upsatureday;
        loadfiledown = line2downsatureday;
    } else {
        loadfileup = line2upnormalday;
        loadfiledown = line2downnormalday;
    }
   
    
    uptrainForm.innerHTML='';
    var tempstr="0";
    var scheduletime=[];
    let today = new Date();
    var nowtime = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds();
    if (nowtime < 10*60) nowtime = nowtime + 24*3600; 
    for ( key in loadfileup){
        for ( key2 in loadfileup[key]){
            if (key2.substr(0, filtteredtext.length) == filtteredtext){
                for ( key3 in loadfileup[key][key2]) {
                    value = loadfileup[key][key2][key3];
                    if (value == ""){
                        continue;
                    }
                    
                    let scheduleTimeArray = value.split(":").map(Number);
                    scheduletime = Number(scheduleTimeArray[0]) * 3600 + scheduleTimeArray[1] * 60 + scheduleTimeArray[2];
                    if (scheduletime < 10*60) scheduletime = scheduletime + 24*3600;

                    if (scheduletime > (nowtime - timeMargin)){

                        if (tempstr[0] == "0") {
                            tempstr = "<b>" + value.slice(0,-3) + " << " + toMinutes(scheduletime-nowtime)  + "분 "+ + toleftSeconds(scheduletime-nowtime);
                            tempstr = toleftSeconds(scheduletime-nowtime) >= 0?  tempstr + "초 남음" + "</b>" : tempstr + "초 초과" + "</b>" ;
                        }
                        else {
                            tempstr = tempstr + "</br>" + value.slice(0,-3) + "   " + toMinutes(scheduletime - nowtime) + "분 남음" ;
                        }
                    }
                }
            }
        
        }
    }
    uptrainForm.innerHTML = tempstr;
    
    downtrainForm.innerHTML='';
    var tempstr="0";
    for ( key in loadfiledown){
        for ( key2 in loadfiledown[key]){
            if (key2.substr(0, filtteredtext.length) == filtteredtext){
                for ( key3 in loadfiledown[key][key2]) {
                    value = loadfiledown[key][key2][key3];
                    if (value == ""){
                        continue;
                    }let scheduleTimeArray = value.split(":").map(Number);
                    scheduletime = Number(scheduleTimeArray[0]) * 3600 + scheduleTimeArray[1] * 60 + scheduleTimeArray[2];
                    if (scheduletime < 10*60) scheduletime = scheduletime + 24*3600;

                    if (scheduletime > (nowtime - timeMargin)){

                        if (tempstr[0] == "0") {
                            tempstr = "<b>" + value.slice(0,-3) + " << " + toMinutes(scheduletime-nowtime)  + "분 "+ + toleftSeconds(scheduletime-nowtime);
                            tempstr = toleftSeconds(scheduletime-nowtime) >= 0?  tempstr + "초 남음" + "</b>" : tempstr + "초 초과" + "</b>" ;
                            
                        }
                        else {
                            tempstr = tempstr + "</br>" + value.slice(0,-3) + "   " + toMinutes(scheduletime - nowtime) + "분 남음" ;
                        }
                    }
                }
            }
        
        }
    }
    downtrainForm.innerHTML = tempstr;
}

function refreshTimeTable(){
    getTimetable(document.getElementById("staction-select").value);
}

function autoRefresh(){
    if (document.getElementById("autorefresh").checked){
        timer = setInterval(refreshTimeTable, refreshInterval);
    }
    else{
        clearInterval(timer);
    }
    
}

function toMinutes(time){
    return time >0 ?  Math.floor( time / 60) : "-";
}

function toleftSeconds(time){
    return time >0 ? time - Math.floor( time / 60) * 60 : time;
}


function getIntervaltimeList(){
    const regex = /\(.*\)/i;
    const filtteredtext = document.getElementById("staction-select").value.replace(regex, "");
    let centerStation = filtteredtext;
    let stationArray = Object.keys(line2intervaltime);
    let timeArray = Object.values(line2intervaltime).map(function(el){
        return Number(el.split(":")[1]) * 60 + Number(el.split(":")[2]);
        }
    );
    let tempList = {};
    
    for (let i=0; i<stationArray.length; i++){
        tempList[stationArray[i]] = Math.abs(timeArray[stationArray.indexOf(centerStation)] - timeArray[i]);
        
/*         tempList[stationArray[i]] = 0;

        if (i < stationArray.indexOf(centerStation)){
            for (let j=i+1; j <= stationArray.indexOf(centerStation); j++ ){
                tempList[stationArray[i]] = tempList[stationArray[i]] + timeArray[j];
            }
        } else if(i > stationArray.indexOf(centerStation)) {
            for (let j=stationArray.indexOf(centerStation)+1; j <= i; j++ ){
                tempList[stationArray[i]] = tempList[stationArray[i]] + timeArray[j];
            }

        } */

    }

    return tempList;
}


function generateTableHead(){
    let thead = document.getElementById("time_between_station").createTHead();
    let row = thead.insertRow();
    let intervalTimeList = getIntervaltimeList();
    
    for (let key of Object.keys(intervalTimeList) ){
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(){
    let table = document.getElementById("time_between_station");
    let intervalTimeList = getIntervaltimeList();
    table.innerHTML = "";
    
    let row = table.insertRow();
    for (let values of Object.values(intervalTimeList)){
        let cell = row.insertCell();
        let text = document.createTextNode(Math.ceil(values/60));
        cell.appendChild(text);
        
    }
    
    generateTableHead();
    
}

function changeStation(value){
    getTimetable(value);
    generateTable();
    
}
    
    

window.addEventListener('DOMContentLoaded', initialize);

