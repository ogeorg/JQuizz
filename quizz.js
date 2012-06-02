var desired_answers;

/**
 * Quizz con su titulo y sus datos
 * @param title el titulo (string)
 * @param quizz_data 
 */
function Quizz(title, quizz_data)
{
    this.title = title;
    this.list = new PriorityList(quizz_data);
}

/**
 * Instala el quizz
 */
Quizz.prototype.install = function()
{
    $("#title-quizz").text(this.title);
    this.show_random_question();
    this.answers_ok = 0;
    this.answers_ko = 0;
    this.update_counts();
    this.init_stats();
}

/**
 * Muestra una pregunta al azar
 */
Quizz.prototype.show_random_question = function()
{
	this.current_levelpos = this.list.getRandomLevelPos();

	var level = this.current_levelpos[0];
	var pos = this.current_levelpos[1];
	var entry = this.list.lists[level][pos];
	
    var question = entry['q'];
    this.set_question(question);
    
    var answer = entry['a'];
    this.set_answer(answer);
}

/**
 * Setea el "espacio de pregunta" con la pregunta
 */
Quizz.prototype.set_question = function(text)
{
    var html = text.replace(/{(.*?)}/g, "<em>$1</em>");
    $('#quizz-question').html(html);
}

/**
 * Setea el "espacio de respuesta" con el (los) campo(s) de respuesta
 * En el texto de respuesta, una palabra entre {} se convierte en campo input[type=text]
 * @param text el texto de respuesta
 */
Quizz.prototype.set_answer = function(text)
{
    this.desired_answers = [];
    var n = 0;
    var quizz = this;
    var html = text.replace(/{(.*?)}/g, function(match, word) {
		// register desired answer
		quizz.desired_answers.push(word);
		// create the input html code
		var size = word.length;
		var input = quizz.get_input(n, size);
		n++;
		return input;
    });

    $('#quizz-answer').html(html);
    $('#quizz-answer-input')[0].focus();
    $('#quizz-answer input').removeClass('incorrect-answer');
}

Quizz.prototype.get_input_name = function(n)
{
    return "quizz-answer-input" + (n==0 ? "" : n);
}

Quizz.prototype.get_input = function(n, size)
{
    var name = this.get_input_name(n)
    var input = "<input type='text' name='"+name+"' id='"+name+"' value='' size='"+size+"' />";
    return input;
}

/**
 * Comprueba la(s) respuesta(s) en los inputs
 */
Quizz.prototype.check_answer = function()
{
	var el = $('#quizz-answer input');
	var given_answers = [];
	el.each(function() { given_answers.push($(this).val()); });

	var equal = this.compare_with_desired_answers(given_answers);
	var level = this.current_levelpos[0];
	var pos = this.current_levelpos[1];
	if (equal) {
		this.list.raiseItem(level, pos);
		this.answers_ok++;
	} else {
		this.list.lowerItem(level, pos);
	    this.answers_ko++;
	}
	this.update_counts();
	this.update_stats();
	this.list.dump2log();
}

Quizz.prototype.compare_with_desired_answers = function(given)
{
	var desired = this.desired_answers;
	var len = desired.length;
	var res = true;
	if (len != given.length)
	// No deberia ser posible
		return false;

    $('#quizz-answer input').removeClass('incorrect-answer');
    for(var n=len-1; n>=0; n--) {
		var name = this.get_input_name(n)
		var input = $('#'+name);
		if (desired[n] != given[n]) {
			input.replaceWith("<span class='incorrect-answer'>"+given[n]+"</span> <span class='correct-answer'>"+desired[n]+"</span>");
//			input.addClass('incorrect-answer');
//			input.focus();
			res = false;
		} else {
			input.replaceWith("<span class='correct-answer'>"+desired[n]+"</span>");
//			input.addClass('correct-answer');
		}
	}
    return res;
}

/**
 * Enseña la siguiente pregunta
 */ 
Quizz.prototype.next_question = function()
{
    this.show_random_question();
}

Quizz.prototype.update_counts = function()
{
	var total = this.answers_ok + this.answers_ko;
	$('#answers-total').text(total);
	$('#answers-ok').text(this.answers_ok);
	$('#answers-ko').text(this.answers_ko);
}

/**
 * Inicializa la tabla de estadisticas ( Incorrectas / Preguntas / Correctas )
 */
Quizz.prototype.init_stats = function()
{
	var table = $('#stats table');
	table.empty();
	
	var levels = this.list.LEVELS;
	var row = "<tr>";
	for(var l=0; l<levels; l++) {
		row += "<td>" + l + "</td>";
	}
	row += "</tr>";
	table.append(row);
	
	row = "<tr>";
	var sum_pc = 0;
	for(var l=0; l<levels; l++) {
		var pc = Math.floor(100 * (l+1) / levels) - sum_pc;
		sum_pc = sum_pc + pc;
		row += "<td style='width: "+pc+"%'><div id='stats-pc-"+l+"' style='background-color: "+this.stats_column_color(l)+"; height: 10%' /></td>";
	}
	row += "</tr>";
	table.append(row);
	
	row = "<tr>";
	for(var l=0; l<levels; l++) {
		row += "<td id='stats-nb-"+l+"'>" + 0 + "</td>";
	}
	row += "</tr>";
	table.append(row);

	this.update_stats();
}

/**
 * Inicializa la tabla de niveles
 */
Quizz.prototype.stats_column_color = function(n)
{
	var x = n / (this.list.LEVELS-1);
	var color;
	if (x<=.5) {
		var c3 = Math.floor(192*2*x)
		var c1 = 192 - c3;
		color = "rgb("+c1+",0,"+c3+")"
	} else {
		var c3 = Math.floor(192*2*(1-x))
		var c2 = 192 - c3;
		color = "rgb(0,"+c2+","+c3+")"
	}
	return color;
}

Quizz.prototype.update_stats = function()
{
	var sizes = this.list.sizes();
	var maxsize = 0
	for(var l=0; l<this.list.LEVELS; l++) {
		// if (sizes[l] > maxsize) maxsize = sizes[l];
		maxsize += sizes[l];
	}
	for(var l=0; l<this.list.LEVELS; l++) {
		$("#stats-nb-"+l).text(sizes[l]);
		var pc = Math.floor(100*sizes[l]/maxsize);
		$("#stats-pc-"+l).css('height', pc+'%');
	}
}

