
/*
PriorityList

Crear una estructura tal que las entradas con más prioridad salgan más amenudo.

+ Cuando se contesta correctamente a una pregunta, la prioridad baja,
  y la pregunta es menos propensa a salir

+ Cuando se contesta incorrectamente, la prioridad sube
  y la pregunta es más propensa a salir
  
Implementacion:

           +---------------------------+
Prioridad: |   3   |     2     |   1   |
Sublista:  |   0   |     1     |   2   |
Posición:  | 0   1   2   3   4   5   6 |
Pos. frac: | 0  .14 .28 .42 .57 .71 .85|
Pregunta:  | 3 | 1 | 4 | 5 | 7 | 2 | 6 |

Elegimos un número x aleatorio entre 0 et 1. Lo elevamos al
cuadrado (x^2), y miramos en que rango cae:

     x            x^2       Pos  Probabilidad
0.00 - 0.38 | 0.00 - 0.14 |  0  |  0.38
0.38 - 0.53 | 0.14 - 0.28 |  1  |  0.15
0.53 - 0.65 | 0.28 - 0.42 |  2  |  0.12
0.65 - 0.76 | 0.42 - 0.57 |  3  |  0.11
0.76 - 0.85 | 0.57 - 0.71 |  4  |  0.09
0.85 - 0.93 | 0.71 - 0.85 |  1  |  0.08
0.93 - 1.00 | 0.85 - 1.00 |  6  |  0.07

     x            x^3       Pos  Probabilidad
0.00 - 0.38 | 0.00 - 0.14 |  0  |  0.38
0.38 - 0.53 | 0.14 - 0.28 |  1  |  0.15
0.53 - 0.65 | 0.28 - 0.42 |  2  |  0.12
0.65 - 0.76 | 0.42 - 0.57 |  3  |  0.11
0.76 - 0.85 | 0.57 - 0.71 |  4  |  0.09
0.85 - 0.93 | 0.71 - 0.85 |  1  |  0.08
0.93 - 1.00 | 0.85 - 1.00 |  6  |  0.07

Las preguntas con más prioridad salen así más amenudo.

Una vez tenemos la posicion de la pregunta, la buscamos
en la lista doble (lista de listas). Por ejemplo sale la
posición 4. La primera sublista tiene 2 elementos, no
puede contener la posición 4. Restamos 2 a 4 ("traslado de
origen"), así que buscamos ahora la posición 2. La seguna
sublista tiene 3 elementos, contiene el elemento en
posición 2. La "posicion doble" es entonces (1,2).
Podemos eliminar el elemento de la sublista 1

Si la respuesta es correcta, pasa al final de la sublista 2
Si la respuesta es incorrecta, pasa al final de la sublista 0

A notar que así las preguntas en posiciones 4 y 5, a pesar de tener
prioridades distintas, tienen casi la misma probabilidad de salir.

Una variante sería trabajar en 2 pasos, primero sobre la prioridad, y luego
la posición dentro de la probabilidad.
*/

/**
 * Lista de prioridad basada en una lista
 */
function PriorityList(list)
{
    this._size = list.length;

	// Copy of the list
    var inicialList = [];
    for(var i=0; i<list.length; i++) {
        inicialList.push(list[i]);
    }

    this.LEVELS = 5;
    var middlepriority = 2; // 0 1 _2_ 3 4
    this.lists = [];
    for(var level=0; level<this.LEVELS; level++) {
		if (level == middlepriority)
			this.lists.push(inicialList);
		else
			this.lists.push([]);
    }
}

/**
 * Devuelve el número total de items
 */
PriorityList.prototype.size = function()
{
    var size = 0;
    for(var level=0; level<this.LEVELS; level++) {
		var list = this.lists[level];
        size += list.length;
    }
    return size;
}

/**
 * Devuelve una lista de número de items en cada nivel
 */
PriorityList.prototype.sizes = function()
{
    var sizes = [];
    for(var level=0; level<this.LEVELS; level++) {
        sizes.push(this.lists[level].length);
    }
    return sizes;
}

PriorityList.prototype.getRandomLevelPos = function()
{
	var x = Math.random();
	return this.x2LevelPos(x);
}

/**
 * Devuelve la cantidad de elementos a tener en cuenta
 * en la elección al azar de un elemento.
 * @return cantitad de elementos
 */
PriorityList.prototype.sampleCount = function()
{
	var total_size = this._size;
	var last_size = this.lists[this.LEVELS-1].length;
	var half = Math.floor(total_size / 2);
	
	// We consider all the list except the last level
	// total last half -->    count
	//    10    3    5     10-3 = 7
	//    10    5    5     10-5 = 5
	//    10    8    5     10-5 = 5
	var count = total_size - Math.min(last_size, half);
	return count;
}

/**
 * Devuelve una pareja (nivel, pos_in_nivel) correspondiente a x in [0,1)
 */
PriorityList.prototype.x2LevelPos = function(x)
{
	// x, x^2 in [0, 1)
    var x2 = x*x;
	
	// pos in [0, _size-1]
    var pos = Math.floor(x2 * this.sampleCount());
    console.log("taking item at pos " + pos);
	
	// 
    for(var sl=0; sl<this.LEVELS; sl++) {
        var sllen = this.lists[sl].length;
        if (pos < sllen) {
		    console.log("                 = " + sl + " / " + pos);
            return [sl, pos];
        }
        pos -= sllen;
    }

    throw "no element at unitary position " + x2;
}

/**
 * Sube un elemento de un nivel. Si ya está en el nivel superior, simplemente
 * lo mueve al final del nuevo nivel
 * @param level nivel actual
 * @param slpos posicion del elemento en el nivel actual
 */
PriorityList.prototype.raiseItem = function(level, slpos)
{
	var item = this.removeItem(level, slpos);
	level = level == this.LEVELS-1 ? level : level+1;
	this.pushItem(level, item);
	return item;
}

/**
 * Baja un elemento de un nivel. Si ya está en el nivel inferior, simplemente
 * lo mueve al final del nuevo nivel
 * @param level nivel actual
 * @param slpos posicion del elemento en el nivel actual
 */
PriorityList.prototype.lowerItem = function(level, slpos)
{
	var item = this.removeItem(level, slpos);
	level = level == 0 ? level : level-1;
	this.pushItem(level, item);
	return item;
}

/**
 * Elimina un element de un nivel y los devuelve
 * @param level nivel actual
 * @param slpos posicion del elemento en el nivel actual
 * @return el elemento eliminado
 */
PriorityList.prototype.removeItem = function(level, slpos)
{
	var list = this.lists[level];
	var item = list.splice(slpos, 1)[0];
	return item;
}

/**
 * Añade un element al final de un nivel
 * @param level nivel actual
 * @param item el elemento
 */
PriorityList.prototype.pushItem = function(level, item)
{
	var list = this.lists[level];
	list.push(item);
}

PriorityList.prototype.dump2log = function()
{
	for(var level=0; level<this.LEVELS; level++) {
		var keys = [];
		var list = this.lists[level];
		for (var k=0; k<list.length; k++ )
			keys.push(list[k].k);
		console.log("Level " + level + ": " + keys.join(", "));
    }
}
