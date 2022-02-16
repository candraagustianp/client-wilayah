// global variable
let id_wil = 0; //variable for regional's id
let data = {}; //objek for json 
let coor = []; //array for polygon coordinate
let drawing = false; //status for drawing polygon



// data api

const url = "http://127.0.0.1:3000/api/";
let provinsi = document.getElementById("provinsi");
let kota = document.getElementById("kota");
let kec = document.getElementById("kecamatan");
let kelu = document.getElementById("kelurahan");

//get data from api
const getData = async (wilayah,param) => {
    const response = await fetch(url + wilayah +"/"+param);
    const data = await response.json();
                
    editor.setSize("100%","100%");
    return data;
}
            
//add child to option
const displayOption = async (objek, param = "") => {
    if (param) id_wil = param; //set id's value for send data

    objek.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "pilih";
    opt.text = "--pilih "+objek.name+"--"
    objek.appendChild(opt);
    const options = await getData(objek.name, param);
    for(let option of options.data) {
        const newOption = document.createElement("option");
        newOption.value = option.id;
        newOption.text = option.name.toUpperCase();
        objek.appendChild(newOption);

    }
                
    if (param) changeCenter(await getData("spasial",param));
}
            
//add listener for all select object
displayOption(provinsi);
provinsi.addEventListener("change", () => {
    displayOption(kota, provinsi.value);
});

kota.addEventListener("change", () => {
    displayOption(kec, kota.value);
});
kec.addEventListener("change", () => {
    displayOption(kelu, kec.value);
});


// code mirror

//make codemirror
var editor = CodeMirror(document.getElementById('feature'), {
    mode: { name: "javascript", json: true },
    theme: "default",
    lineNumbers: true,
    readOnly: false,
});

// toggle codemirror
function openCode() {
    document.getElementById("feature").style.width = "30%";
    document.getElementById("map").style.width = "70%";
    document.getElementById("drawer").style.display="none";
    document.getElementById("undo").style.display="inline";
    document.getElementById("save").style.display="inline";
    map.resize();
    map.on("click", getCoord);
    drawing = true;
    setValue();
}

function closeCode() {
    document.getElementById("feature").style.width = "0";
    document.getElementById("map").style.width= "100%";
    document.getElementById("drawer").style.display="inline";
    document.getElementById("undo").style.display="none";
    document.getElementById("save").style.display="none";
    map.resize();
    map.off("click", getCoord);
    drawing = false;
}


// mapbox

mapboxgl.accessToken = 'pk.eyJ1IjoiY2FuZHJhYWd1c3RpYW4iLCJhIjoiY2t2b284NjV3MjRteDJ1cWc2ajd1dXRraCJ9.qlP72PtgrpVITxr7Aa_GDA';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [119.3829406, -2.1821934], // starting position [lng, lat]
    zoom: 4 // starting zoom
});
map.on("mouseenter", "cluster",() => {
    if (drawing) map.getCanvas().style.cursor = 'pointer';
    else map.getCanvas().style.cursor = 'grab';
});

// change view on map

function changeCenter(data) {
    let zoom = 0;
    console.log(data.data.id_daerah);
    if (data.data.id_daerah < 100) zoom = 7.5;
    else if (data.data.id_daerah < 10000) zoom = 9;
    else if (data.data.id_daerah < 1000000) zoom = 11;
    else if (data.data.id_daerah <= 9999999999) zoom = 13
    else zoom = 7;
    switch(data.data.id_daerah.length) {
        case 2 : 
            zoom = 7.5;
            break;
        case 4 :
            zoom = 9;
            break;
        case 6 :
            zoom = 11;
            break;
        case 10 : 
            zoom = 13;
            break;
        default :
            console.log("tidak masuk kriteria id wilayah");
    }
    map.flyTo({
        center: JSON.parse(data.data.center),
        zoom: zoom
    });
}


// event for map and codemirror

function setValue() {
    data = {
        id_wil,
        zoom: map.getZoom(),
        center: [map.getCenter().lng, map.getCenter().lat],
        coor,
    };
    editor.setValue(JSON.stringify(data,null,2));
}

//event click map
function getCoord(e) {
    let tmpCoor = [e.lngLat.lng, e.lngLat.lat];
    coor.push(tmpCoor);
    setValue();
}