var lugares = [];
var matriz;
$(document).ready(function () {
    $('#btn-agregar').click(function () {
        var address;
        if (place != null) {
            address = place.formatted_address;
            if (agregarLugar(place)){
                if ($('.list-group li').length == 0){
                    $('.list-group').append('<li class="list-group-item first-li">' + address + '</li>');
                    
                }else                
                    $('.list-group').append('<li class="list-group-item">' + address + '</li>');
                
            }
        }
    });

    $('#btn-limpiar').click(function () {
        lugares = [];
        $('.list-group').html('');
    });
    $('#btn-calcula').click(function () {
        obtenMatrizDist();
    });


});

var agregarLugar = function (lugar) {
    if (lugar == null)
        return false;
    var id = lugar.place_id;
    var sigue = true;
    var i = 0;
    while (sigue && i < lugares.length) {
        sigue = lugares[i].place_id != id;
        i++;
    }
    if (sigue) {
        lugares.push(lugar);
    }
    return sigue;
}

var obtenMatrizDist = function () {
    var locations = [];
    for (var i = 0; i < lugares.length; i++) {
        locations.push(lugares[i].geometry.location);
    }
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: locations,
            destinations: locations,
            travelMode: 'DRIVING',
            //transitOptions: TransitOptions,
            //drivingOptions: DrivingOptions,
            //unitSystem: UnitSystem,
            //avoidHighways: Boolean,
            //avoidTolls: Boolean,
        }, callback);

    function callback(response, status) {
        creaMatrizDist(response);
        var rutaOptima = resuelveTSP();
        mostrarResultado(rutaOptima);

    }
}

var creaMatrizDist = function (json) {
    var numRows = json.rows.length;
    var numCols = json.rows[0].elements.length;

    matriz = new Array(numRows)
    for (i = 0; i < numRows; i++)
        matriz[i] = new Array(numCols);

    for (var i = 0; i < numRows; i++) {
        for (var j = 0; j < numCols; j++) {
            matriz[i][j] = json.rows[i].elements[j].duration.value;
        }
    }
}

var resuelveTSP = function () {
    if (matriz == null) return null;
    var n = matriz.length;
    var p = generarPermutaciones(n - 1);
    var rutas = [];
    for(var i =0;i<p.length;i++){
        rutas.push(p[i].map(function(x) { return parseInt(x) +1; }));
    }

    var costos = calculaCostos(rutas, matriz);
    if (costos == null) return null;
    var min = 0;
    for (var i = 1; i < costos.length; i++) {
        if (costos[i] < costos[min])
            min = i;
    }

    var res = { 'ruta': rutas[min], 'tiempo': costos[min] }
    return res;

}

var calculaCostos = function (rutas, matriz) {
    if (rutas == null || matriz == null) return null;;
    var n = rutas.length;
    var costos = [];
    var suma = 0;
    for (var i = 0; i < n; i++) {
        suma = 0;
        suma += matriz[0][rutas[i][0]];
        for (var j = 0; j < rutas[0].length - 1; j++) {
            suma += matriz[rutas[i][j]][rutas[i][j + 1]];
        }
        if($('#cmn-toggle-4').is(':checked'))
            suma += matriz[rutas[i][j]][0];
        costos.push(suma);
    }

    return costos;

}

function generarPermutaciones(n) {
    if (n == null) return n;
    var s = '';
    for (var i = 0; i < n; i++)
        s += i;
    var p = perms(s);
    var res = [];
    for(var i=0;i<p.length;i++){
        res.push(p[i].split(""));
    }
    return res;
}
function perms(string) {

    if (string.length < 2) return string;

    var permutations = [];

    for (var i = 0; i < string.length; i++) {
        var char = string[i];

        // Cause we don't want any duplicates:
        if (string.indexOf(char) != i) // if char was used already
            continue;           // skip it this time

        var remainingString = string.slice(0, i) + string.slice(i + 1, string.length);

        for (var subPermutation of perms(remainingString))
            permutations.push(char + subPermutation)

    }
    return permutations;
}

var mostrarResultado = function (res) {
    var ruta = res.ruta;    
    if (ruta == null || matriz == null) return "Ha habido un error.";
    if($('#cmn-toggle-4').is(':checked'))
        ruta.push(0);
    var tiempoTotal = res.tiempo;
    var html = "";
    var reng = "";
    var t;
    t = matriz[0][ruta[0]];    
    html += '' +
        '<tr>' +
            '<td>'+lugares[0].formatted_address+'</td>' +
            '<td>'+lugares[ruta[0]].formatted_address+'</td>' +
            '<td>'+(t).toString().toHHMMSS()+'</td>' +
        '</tr>';
    for (var i = 0; i < ruta.length-1; i++) {
        t = matriz[ruta[i]][ruta[i+1]];    
        html += '' +
            '<tr>' +
                '<td>'+lugares[ruta[i]].formatted_address+'</td>' +
                '<td>'+lugares[ruta[i+1]].formatted_address+'</td>' +
                '<td>'+(t).toString().toHHMMSS()+'</td>' +
            '</tr>';
    }
    html += '' +
    '<tr>' +
        '<td><strong>Tiempo total</strong></td>' +
        '<td></td>' +
        '<td>'+(tiempoTotal).toString().toHHMMSS()+'</td>' +
    '</tr>';

    $('#table-body').html(html);
    
    $('#modal').modal('show');
    if($('#cmn-toggle-4').is(':checked'))        
        ruta = ruta.slice(0, -1)



}



String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
}