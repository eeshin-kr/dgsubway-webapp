var statustext = 0;
var latitude = 0;
var longitude = 0;
var nearestStation = "";
var timeMargin = 60; //60초 이전 도착시각 표시
var refreshInterval = 1000;
var timer = 0;
var changeHTMLCode1 = "<a class=\"stationSelection\" href=\"#\" onclick=\"changeStationSelectionBox(this)\">";
var changeHTMLCode2 = "</a>";
var nearestStationQuantity = 5; //가장 가까운 역 표시 갯수
var wantedStation = ""; //목적지 역 설정

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
    generateTable();
    changeDestination();
    
    
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
    let tempstr = "";
    let selbox = document.getElementById("station-select");
    
   //temparray =  temparray.concat(line1pos,line2pos,line3pos);
   temparray =  temparray.concat(line2pos);
        temparray.sort(function(a,b){
        return a["거리"] - b["거리"];
    });
    
    selbox.value = temparray[0]["역사명"];
    
    for (let i=0 ; i < nearestStationQuantity; i++){
        tempstr = tempstr + changeHTMLCode1 + temparray[i]["역사명"] + changeHTMLCode2;
    }
    statustext.innerHTML = tempstr;
    
    getTimetable(nearestStation);
}

function changeStationSelectionBox(obj){
    document.getElementById("station-select").value = obj.innerHTML;
    changeStation(obj.innerHTML);
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
    var tempstr="-";
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
                        tempstr = tempstr + value.slice(0,-3);
                        tempstr = tempstr + " -->  " + toMinutes(scheduletime-nowtime) + "분  ";

                        
                        if (tempstr[0] == "-") {
                            tempstr = tempstr.substr(1);
                            tempstr = tempstr + toleftSeconds(scheduletime-nowtime);
                            tempstr = toleftSeconds(scheduletime-nowtime) >= 0?  tempstr + "초 남음" :  tempstr + "초 경과" ;
                            tempstr = "<span class=\"nowTrain\">" + tempstr;
                            tempstr = tempstr + "</span>";
                            tempstr = tempstr + "</br>";
                        } else {
                            tempstr = tempstr + " 남음" + "</br>";
                        }
                    }
                            
                }
                       
                    
            }
        }
        
    }

    uptrainForm.innerHTML = tempstr;
    
    downtrainForm.innerHTML='';
    var tempstr="-";
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
                        tempstr = tempstr + value.slice(0,-3);
                        tempstr = tempstr + " -->  " + toMinutes(scheduletime-nowtime) + "분  ";

                        
                        if (tempstr[0] == "-") {
                            tempstr = tempstr.substr(1);
                            tempstr = tempstr + toleftSeconds(scheduletime-nowtime);
                            tempstr = toleftSeconds(scheduletime-nowtime) >= 0?  tempstr + "초 남음" :  tempstr + "초 경과" ;
                            tempstr = "<span class=\"nowTrain\">" + tempstr;
                            tempstr = tempstr + "</span>";
                            tempstr = tempstr + "</br>";
                        } else {
                            tempstr = tempstr + " 남음" + "</br>";
                        }
                    }
                }
            }
        
        }
    }
    downtrainForm.innerHTML = tempstr;
}

function refreshTimeTable(){
    getTimetable(document.getElementById("station-select").value);
    if (wantedStation != ""){
        getDestinationETAlist(wantedStation);
    }
}

function autoRefresh(){
    refreshTimeTable();
    if (document.getElementById("autorefresh").checked){
        timer = setInterval(refreshTimeTable, refreshInterval);
    }
    else{
        clearInterval(timer);
    }
    
}

function toMinutes(time){
    return time >0 ?  Math.floor( time / 60) : 0;
}

function toleftSeconds(time){
    return time >0 ? time - Math.floor( time / 60) * 60 : time;
}


function getIntervaltimeList(){
    const regex = /\(.*\)/i;
    const filtteredtext = document.getElementById("station-select").value.replace(regex, "");
    let centerStation = filtteredtext;
    let stationArray = Object.keys(line2intervaltime);
    let timeArray = Object.values(line2intervaltime).map(function(el){
        return Number(el.split(":")[1]) * 60 + Number(el.split(":")[2]);
        }
    );
    let tempList = {};
    
    for (let i=0; i<stationArray.length; i++){
        tempList[stationArray[i]] = Math.abs(timeArray[stationArray.indexOf(centerStation)] - timeArray[i]);
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
    changeDestination();
    
}

function changeDestination(){
    document.getElementById("uptrainlabel").innerHTML = Object.keys(line2upnormalday[0])[0];
    document.getElementById("downtrainlabel").innerHTML = Object.keys(line2upnormalday[line2upnormalday.length - 1])[0];
    
}

function printDestinationTable(station){
    let timetable1 = document.getElementById("timetable1");
    let timetable2 = document.getElementById("timetable2");
    
    timetable1.style.display= "none";
    timetable2.style.display= "flex";
    
    getDestinationETAlist(station);
    
    if (station == "선택"){
        timetable1.style.display= "flex";
        timetable2.style.display= "none";
        wantedStation = "";
        
    }
    
}

function getDestinationETAlist(station){
    const regex = /\(.*\)/i;
    const filtteredtext = document.getElementById("station-select").value.replace(regex, "");
    station = station.replace(regex, "");
    let centerStation = filtteredtext;
    let intervalList = getIntervaltimeList();
    let stationArray = Object.keys(line2intervaltime);
    let updownkind = "";
    let updownDestination = "";
    let weekdaySelection = document.getElementById("weekday");
    var loadfile;
    let destinationtrainForm = document.getElementById("destinationtrain");
    wantedStation = station;
    let estimatedtime = 0;
    
    
    //상선 하선 판단, 방면 판단
    
    if (stationArray.indexOf(station) < stationArray.indexOf(centerStation)) {
        updownkind = "상선";
        updownDestination = stationArray[0];
    } else {
        updownkind = "하선";
        updownDestination = stationArray[stationArray.length-1];
    }
    
    //상선 하선 방면 변경
    document.getElementById("updownkind").innerHTML = updownkind;
    document.getElementById("updowndestinationlabel").innerHTML = updownDestination;
    document.getElementById("selectedStation").innerHTML = centerStation;
    document.getElementById("destinationStation").innerHTML = wantedStation;
    
    //불러올 파일 선택
    if (weekdaySelection.innerHTML == "일요일"){
        loadfile = updownkind == "상선"? line2upsunday : line2downsunday
    } else if (weekdaySelection.innerHTML == "토요일"){
        loadfile = updownkind == "상선"? line2upsatureday : line2downsatureday
    } else {
        loadfile = updownkind == "상선"? line2upnormalday : line2downnormalday
    }
    
    //역 간 거리 계산(초)
    estimatedtime = intervalList[station];
    
    destinationtrainForm.innerHTML = "";
    var tempstr="-";
    var scheduletime=[];
    let today = new Date();
    var nowtime = today.getHours() * 3600 + today.getMinutes() * 60 + today.getSeconds();
    if (nowtime < 10*60) nowtime = nowtime + 24*3600; 
    for ( key in loadfile){
        for ( key2 in loadfile[key]){
            if (key2.substr(0, filtteredtext.length) == filtteredtext){
                for ( key3 in loadfile[key][key2]) {
                    value = loadfile[key][key2][key3];
                    if (value == ""){
                        continue;
                    }
                    
                    let scheduleTimeArray = value.split(":").map(Number);
                    scheduletime = Number(scheduleTimeArray[0]) * 3600 + scheduleTimeArray[1] * 60 + scheduleTimeArray[2];
                    if (scheduletime < 10*60) scheduletime = scheduletime + 24*3600;

                    if (scheduletime > (nowtime - timeMargin)){
                            tempstr = tempstr + value.slice(0,-3) + " 출발 >> ";
                            tempstr = tempstr + secondToTimeString(scheduletime + estimatedtime).slice(0,-3) + " 도착 ";
                            tempstr = tempstr + " -->  ";
                            tempstr = tempstr + toMinutes(scheduletime-nowtime)  + "분 ";
                            
                            
                        if (tempstr[0] == "-") {
                            tempstr = tempstr.substr(1);
                            tempstr = toleftSeconds(scheduletime-nowtime) >= 0? tempstr + toleftSeconds(scheduletime-nowtime) + "초 남음" : tempstr +  toleftSeconds(scheduletime-nowtime) + "초 초과" ;
                            tempstr = "<span class=\"nowTrain\">" + tempstr;
                            tempstr = tempstr + "</span>";
                            tempstr = tempstr + "</br>";
                        } else {
                            tempstr = tempstr + " 남음" + "</br>";
                        }
                        
                    }
                }
            }
        
        }
    }
    destinationtrainForm.innerHTML = tempstr;
    
}

function secondToTimeString(second){
    return Math.floor(second/3600) + ":" + String(Math.floor( (second % 3600) / 60 )).padStart(2, "0") + ":" + String(Math.floor(second % 60)).padStart(2, "0");
    
}

window.addEventListener('DOMContentLoaded', initialize);

