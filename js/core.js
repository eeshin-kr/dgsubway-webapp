var currentPosition = 0;
var latitude = 0;
var longitude = 0;
var nearestStation = "";


function initialize() {
  currentPosition = document.getElementById("current_position");
  changeDay();
  getLocation();
}

function getLocation() {
    if (!navigator.geolocation){
        currentPosition.innerHTML = "위치 기능이 현재 브라우저에서 동작하지 않습니다.";
    } else {
        currentPosition.innerHTML = "위치 파악 중...";
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

function success(position) {
    latitude = Number(position.coords.latitude);
    longitude = Number(position.coords.longitude);
    currentPosition.innerHTML = "위도: " + latitude + " 경도: " + longitude;
    
    getDistanceFromStations();
    printNearestStation();
    
}

function error(){
    currentPosition.innerHTML = "위치 정보를 찾을 수 없습니다."
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

function changeStation(obj){
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
    for ( key in loadfileup){
        for ( key2 in loadfileup[key]){
            if (key2.substr(0, filtteredtext.length) == filtteredtext){
                for ( key3 in loadfileup[key][key2]) {
                    value = loadfileup[key][key2][key3];
                    if (value == ""){
                        continue;
                    }
                    var opt = document.createElement('option');
                    opt.innerHTML=value;
                    uptrainForm.appendChild(opt);
                }
            }
        
        }
    }
    downtrainForm.innerHTML='';
    for ( key in loadfiledown){
        for ( key2 in loadfiledown[key]){
            if (key2.substr(0, filtteredtext.length) == filtteredtext){
                for ( key3 in loadfiledown[key][key2]) {
                    value = loadfiledown[key][key2][key3];
                    if (value == ""){
                        continue;
                    }
                    var opt = document.createElement('option');
                    opt.innerHTML=value;
                    downtrainForm.appendChild(opt);
                }
            }
        
        }
    }
}

window.addEventListener('DOMContentLoaded', initialize);
