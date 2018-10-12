// JavaScript Document

//Some vars to begin
var cand_num = 0;
var row_num = 0;
var vround_num = 0;
var cand_rows = [];

//Get Google Charts ready for later
// Load the Google Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

function vis(id, opt) { //Various visibility controls
	var e = document.getElementById(id); 
	if (opt === 'disp'){ //If the 'disp' option is chosen:
		e.style.display = 'block'; //Display the element
		
	} else if (opt === 'hide'){ //Otherwise, if the 'hide' option is chosen:
		e.style.display = 'none'; //Hide the element
		
	} else { //If there's no option, toggle visibility
	
		if(e.style.display === 'block') //If the element is already visible:
			e.style.display = 'none'; //Hide it
		else 
			e.style.display = 'block'; //Otherwise, show it
	}
}

function votesys(){ //Choosing a voting system
	document.getElementById('info').style.display = 'none'; //Close the extra info
		
	var sel_sys = document.getElementById('votesys').value; //Grab the system choice

	if(sel_sys === "sys_plur"){ //If plurality is selected:
		vis('ir_vote', 'hide'); //Hide the IR div
		vis('plur_vote', 'disp'); //Display the plurality div
		vis('results', 'hide'); //Hide the Results div
		
		cand_num = 0; //Set the candidate count back
		vround_num = 0; //Set the vote round count back
		row_num = 0; //Set the row count back
		cand_rows = ["plur_can0_row"]; //Set the candidate storage array back to normal
	} else if (sel_sys ===  "sys_ir"){
		vis('plur_vote', 'hide'); //Hide the plurality div
		vis('ir_vote', 'disp'); //Display the IR div
		vis('results', 'hide'); //Hide the Results div
		
		cand_num = 0; //Set the candidate count back
		vround_num = 0; //Set the vote round count back
		row_num = 0; //Set the row count back
		cand_rows = ["ir_can0_row"]; //Set the candidate storage array back to normal
	} else {
		vis('plur_vote', 'hide'); //Hide the plurality div
		vis('ir_vote', 'hide'); //Hide the IR div
		vis('results', 'hide'); //Hide the Results div
		
		cand_num = 0; //Set the candidate count back
		vround_num = 1; //Set the vote round count back
		row_num = 0; //Set the row count back
		cand_rows = []; //Set the candidate storage array back to empty
	}
}
	
function plur_vote_plus(){ //Add a row to the plurality vote table
	cand_num += 1; //Add one to each of the counters
	row_num += 1;
		
	var table = document.getElementById("plur_vote_table"); //Grab the table
	
	var row = table.insertRow((row_num + 1)); //Make a new row (table content goes from 1, so go one above the count)
	row.id = "plur_can" + cand_num + "_row"; //Give the row an id
	cand_rows.push("plur_can" + cand_num + "_row"); //Add that to the storage array
	
	//Make some cells
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	
	//Add some text
	cell1.innerHTML = '<input type="text" name="plur_can' + cand_num + '_name" id="plur_can' + cand_num + '_name" size="15">';
	cell2.innerHTML = '<input type="number" name="plur_can' + cand_num + '_round' + vround_num + '" id="plur_can' + cand_num + '_round' + vround_num + '">';
	cell3.innerHTML = '<button type="button" onClick="plur_del_row(this);" title="Click to remove candidate">X</button>';
}

function plur_del_row(x) { //Deletes a candidate row from the plurality vote table
	row_num -= 1; //Minus one from the row counter
	
	document.getElementById("plur_vote_table").deleteRow(x.parentNode.parentNode.rowIndex);
  //           Select the plurality table, then delete row of the row number of the button cell's parent
  	
	//Remove from the storage array
	var row_index = cand_rows.indexOf(x.parentNode.parentNode.id); //Find where the removed row is
	if (row_index > -1) { //If it's in there:
   		cand_rows.splice(row_index, 1); //Remove it
	} else {
		alert("!!! FATAL ERROR !!!\nPlease refresh the page and try again."); //If it's not, something went *very* wrong!
	}
}

function plur_vote_submit(){ //The main plurality vote program
	var cand = []; //Candidate array for later
	var ind = 0; //Counter for later
	
	//Get each candidate and their number of votes and add these to an array
	for (var i = 0; i <= cand_num; i++){ //Run for as many times as there are candidates
		if (cand_rows.indexOf("plur_can" + i+ "_row") > -1) { //If that candidate number actually exisits:
			var print_name = document.getElementById("plur_can" + i + "_name").value; //Grab the candidate name
			var print_score = document.getElementById("plur_can" + i + "_round0").value; //Grab the number of votes
			
			if (print_name === null || print_name === "" || print_score === null) { //Validate input - check for any empty inputs/NaN
				alert("!!! ERROR !!!\nInvaid Input!\n\nPlease check all input data and fix or delete any rows with empty or incorrect cells.");
				return;
			} else if (print_score.indexOf(".")!==-1){ //Check for any decimal places
				alert("!!! ERROR !!!\nInvaid Input!\n\nPlease check all Vote Count data and remove any decimal places from the input.");
				return;
			} else if (isNaN(parseInt(print_score))){ //Check for any non numbers
				alert("!!! ERROR !!!\nInvaid Input!\n\nPlease check all Vote Count data and ensure that only numbers are entered into count boxes.");
				return;
			} else {
				print_score = parseInt(print_score); //If it's all good, parse the input number as integer for later
			}
			
			cand[ind] = {name: print_name,score: print_score}; //Put these into a new object in the main array
			ind += 1; //Add one to the counter
		}
	}
	
	var highSoFar = 0; //Set for later, to record the highest score so far
	var winner = []; //For later, hold the winner
	var totalVotes = 0; //Set for later, to record the total number of votes
	var DataForChart = []; //Set for later, to hold the chart data array
	
	//Find the winner
	for (var j = 0; j < cand.length; j++){ //Run for each candidate in the array
		if (cand[j].score > highSoFar){ //If this candidate's score is larger than the highest so far:
			winner = [cand[j]]; //Set them as the winner, for now
			highSoFar = cand[j].score; //Set their score as the new high to beat
		} else if (cand[j].score === highSoFar) { //If their score is the same as the highest so far (i.e. a tie):
			winner.push(cand[j]); //Add them to the winners as well
		}
		totalVotes += cand[j].score; //Add all scores together in on variable
		DataForChart[DataForChart.length] = [cand[j].name, cand[j].score]; //Add this candidate the the array for the chart
	}
	
	plur_winner(); //Output results
	
	function plur_winner(){
		//Add percentages to the table
		for (var k = 0; k < cand.length; k++){//Run for each candidate in the array
			document.getElementById('plur_vote_table').rows[k+1].deleteCell(2);
			document.getElementById('plur_vote_table').rows[k+1].insertCell(2).innerHTML = "<em>(" + ((cand[k].score/totalVotes)*100).toFixed(2) + "%)<\/em>";
		}
		
		//Print out the winner
		if (winner.length === 1){ //If there's only one winner:
			document.getElementById("output").innerHTML = "<em><strong>" + winner[0].name + "</strong> has won with <strong>" + winner[0].score + "</strong> votes (" + ((winner[0].score/totalVotes)*100).toFixed(2) + "%)<\/em>"; //Just print out their name
			
		} else if (winner.length === 2){ //Or, If there are two winners:
			document.getElementById("output").innerHTML = "<em><strong>" + winner[0].name + "</strong> and <strong>" + winner[1].name + "</strong> have tied with <strong>" + winner[0].score + "</strong> votes (" + ((winner[0].score/totalVotes)*100).toFixed(2) + "%) each"; //Print name 1, followd by 'and', then name 2
			
		} else if (winner.length > 2){ //Otherwise, If there's more than 2 winners:
			var msg = ""; //(Set up a variable to hold the message)
			for (k = 0; k < (winner.length - 2); k++){ // Go through all names, except the last two
				msg += "<strong>" + winner[k].name + "</strong>, "; //Write them out with a comma between them
			}
			msg += "<strong>" + winner[winner.length - 2].name + "</strong> and <strong>" + winner[winner.length - 1].name + "</strong> have tied with <strong>" + winner[0].score + "</strong> votes (" + ((winner[0].score/totalVotes)*100).toFixed(2) + "%) each"; //Then add the last two with 'and' between them
			document.getElementById("output").innerHTML = "<em>" + msg + "</em>"; //Then print that out
		}
		
	  
		if (document.body.offsetHeight> innerHeight){ //If the webpage is bigger than the browser window (if there's a vertical scroll bar):
			vis('scroll_to_result', 'disp'); //Display some navigation buttons
			vis('scroll_to_top', 'disp');
		}
		
		vis('results', 'disp'); //Display the results section
		document.getElementById("results").scrollIntoView(true); //Scroll down to the output
					
		// Fancy Google Chart!
		// Set a callback to run when the Google Visualization API is loaded.
		google.charts.setOnLoadCallback(drawChart);
		// Callback that creates and populates a data table, instantiates the chart, passes in the data and draws it.
		function drawChart() {
			// Create the data table.
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Candidate');
			data.addColumn('number', 'Votes');
			data.addRows(DataForChart);
	
			// Set chart options
			var options = {'width':400, 'height':250};
	
			// Instantiate and draw our chart, passing in some options.
			var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
			chart.draw(data, options);
		}

		vis('chart_div', 'disp'); //Display the chart
	}
}


function ir_vote_plus(){ //Add a row to the IR vote table
	cand_num += 1;
	row_num += 1;
	
	var table = document.getElementById("ir_vote_table"); //Grab the table
	
	var row = table.insertRow((row_num + 1)); //Make a new row (table content goes from 1, so go one above the count)
	row.id = "ir_can" + cand_num + "_row"; //Give the row an id
	cand_rows.push("ir_can" + cand_num + "_row"); //Add that to the storage array
	
	//Make some cells
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	
	//Add some text
	cell1.innerHTML = '<input type="text" name="ir_can' + cand_num + '_name" id="ir_can' + cand_num + '_name" size="15">';
	cell2.innerHTML = '<input type="number" name="ir_can' + cand_num + '_round' + vround_num + '" id="ir_can' + cand_num + '_round' + vround_num + '">';
	cell3.innerHTML = '<button type="button" onClick="ir_del_row(this);" title="Click to remove candidate">X</button>';

}

function ir_del_row(x) { //Deletes a candidate row from the IR vote table
	row_num -= 1; //Minus one from the row counter
	
	document.getElementById("ir_vote_table").deleteRow(x.parentNode.parentNode.rowIndex);
  //               Select the IR table, then delete row of the row number of the button cell's parent
  
	//Remove from the storage array
	var row_index = cand_rows.indexOf(x.parentNode.parentNode.id); //Find where the removed row is
	if (row_index > -1) { //If it's in there:
   		cand_rows.splice(row_index, 1); //Remove it
	} else {
		alert("!!! FATAL ERROR !!!\nPlease refresh the page and try again."); //If it's not, something went *very* wrong!
	}
}

function ir_vote_submit(){ //The main IR vote program
	
	if (vround_num > 0){ //If there are preferences, add them to the main score
		for (var w = 0; w <= cand_num; w++){ //Run for as many times as there are candidates
			if (document.getElementById("ir_can" + w + "_round" + vround_num) !== null) { //If that candidate hasn't already lost:
				var tfr_score = document.getElementById("ir_can" + w + "_round" + vround_num).value; //Grab the number of transfer votes
				
				if (tfr_score === null) { //Validate input - check for any empty inputs/NaN
					alert("!!! ERROR !!!\nInvaid Input!\n\nPlease check all Transfer data and fix or delete any rows with empty or incorrect cells.");
					return;
				} else if (tfr_score.indexOf(".")!==-1){ //Check for any decimal places
					alert("!!! ERROR !!!\nInvaid Input!\n\nPlease check all Transfer data and remove any decimal places from the input.");
					return;
				} else if (isNaN(parseInt(tfr_score))){ //Check for any non numbers
					alert("!!! ERROR !!!\nInvaid Input!\n\nPlease check all Transfer data and ensure that only numbers are entered into count boxes.");
					return;
				} else {
					document.getElementById("ir_can" + w + "_round0").value = parseInt(document.getElementById("ir_can" + w + "_round0").value) + parseInt(tfr_score); //If it's all good, add the transfer
					document.getElementById("ir_can" + w + "_round" + vround_num).disabled = true; //Disable each of the transfer input boxes
				}
			} else {
				document.getElementById("ir_can" + w + "_round0").value = '0'; //If they're a loser, wipe their score
			}
		}
	}
	
	var cand = []; //Candidate array for later
	var ind = 0; //Counter for later

	//Get each candidate and their number of votes and add these to an array
	for (var i = 0; i <= cand_num; i++){ //Run for as many times as there are candidates
		if (cand_rows.indexOf("ir_can" + i+ "_row") > -1) { //If that candidate number actually exisits:
			var print_name = document.getElementById("ir_can" + i + "_name").value; //Grab the candidate name
			var print_score = document.getElementById("ir_can" + i + "_round0").value; //Grab the number of votes
			
			if (print_name === null || print_name === "" || print_score === null || print_score === "") { //Validate input - check for any empty inputs/NaN
				alert("!!! ERROR !!!\nInvaid Input!\n\nPlease check all input data and fix or delete any rows with empty or incorrect cells.");
				return;
			} else if (print_score.indexOf(".")!==-1){ //Check for any decimal places
				alert("!!! ERROR !!!\nInvaid Input!\n\nPlease check all vote count data and remove any decimal places from the input.");
				return;
			} else if (isNaN(parseInt(print_score))){ //Check for any non numbers
				alert("!!! ERROR !!!\nInvaid Input!\n\nPlease check all Vote Count data and ensure that only numbers are entered into count boxes.");
				return;
			} else {
				print_score = parseInt(print_score); //If it's all good, parse the input number as integer for later
				//mast[i] = {name: print_name,score: print_score}; //Put these into a new object into the master array, as well
				cand[i] = {name: print_name,score: print_score}; //Put these into a new object in the main array

			}
			if (print_score > 0){
								ind += 1; //Add one to the counter
			}
		}
	}

	var highSoFar = 0; //Set for later, to record the highest score so far
	var winner = []; //For later, hold the winner
	var totalVotes = 0; //Set for later, to record the total number of votes
	var DataForChart = []; //Set for later, to hold the chart data array
	
	//Find the winner
	for (var j = 0; j < cand.length; j++){ //Run for each candidate in the array
		if (cand[j].score > highSoFar){ //If this candidate's score is larger than the highest so far:
			winner = [cand[j]]; //Set them as the winner, for now
			highSoFar = cand[j].score; //Set their score as the new high to beat
		} else if (cand[j].score === highSoFar) { //If their score is the same as the highest so far (i.e. a tie):
			winner.push(cand[j]); //Add them to the winners as well
		}
		totalVotes += cand[j].score; //Add all scores together in on variable
		DataForChart[DataForChart.length] = [cand[j].name, cand[j].score]; //Add this candidate the the array for the chart
	}
	
	var lowSoFar = totalVotes; //Set for later at the total number of votes, to record the lowest score so far
	var loser = []; //For later, hold the loser
	var loserNo = []; //For later, hold the number ref. for losers
	var out = []; //For later, hold those that are permanently out
	
	console.log(cand);
	
	//Find the loser
	for (var l = 0; l < cand.length; l++){ //Run for each candidate in the array
		if (cand[l].score < lowSoFar && cand[l].score !== 0){ //If this candidate's score is lesser than the lowest so far (and not 0):
			loser[0] = cand[l]; //Set them as the loser, for now
			loserNo[0] = l; //Record their number
			lowSoFar = cand[l].score; //Set their score as the new low to beat
		} else if (cand[l].score === lowSoFar && cand[l].score !== 0) { //If their score is the same as the lowest so far (i.e. a tie):
			loser.push(cand[l]); //Add them to the losers as well
			loserNo.push(l);
		} else if (cand[l].score === 0){ //If they're already a loser:
			out.push(l); //Add them to be permanently out
		}
	}
	
	var winner_pcent = ((winner[0].score/totalVotes)*100).toFixed(2); ///Find the percentage score of the winner
	
	if (winner_pcent > 50){ //If the winning candidate also has greater than 50% of the vote:
		ir_winner(); //They are the winner - output results
	} else {
		ir_prefs();
	}
			
		function ir_prefs(){
			vround_num += 1; //Add one to the round counter
			vis('chart_div', 'hide'); //Hide any exisitng charts
						
			var round_name = "";
			
			var round_num = parseInt(vround_num);
			var num_1 = parseInt(vround_num) % 10;
			var num_2 = parseInt(vround_num) % 100;
			if (num_1 === 1 && num_2 !== 11) {
				round_name =  round_num + "st";
			} else if (num_1 === 2 && num_2 !== 12) {
				round_name = round_num + "nd";
			} else if (num_1 === 3 && num_2 !== 13) {
				round_name = round_num + "rd";
			} else {
				round_name = round_num + "th";
			}
			
			if (document.body.offsetHeight> innerHeight){ //If the webpage is bigger than the browser window (if there's a vertical scroll bar):
				vis('scroll_to_result', 'disp'); //Display some navigation buttons
				vis('scroll_to_top', 'disp');
			}
			vis('results', 'disp'); //Display the results section
			document.getElementById("results").scrollIntoView(true); //Scroll down to the output
								
			document.getElementById('ir_table_pcent_head').className = "blank_cell3"; //Fix that one blank cell & it's borders
			
			document.getElementById('ir_vote_table').rows[0].insertCell(vround_num+2).innerHTML = "<strong>" + round_name + " Transfer</strong>";
			
			//Delete + button
			if (document.getElementById('ir_plus_row') !== null){
				var plus_row = document.getElementById('ir_plus_row');
				plus_row.parentNode.removeChild(plus_row);
			}

			//Print out the message
			var msg = "<em><strong> No candidate has a majority, move to preferences. <\/strong><\/em><br>"; //Start putting it together
			if (loser.length === 1){ //If there's only one loser:
				msg += "Count and enter preference votes from <strong>" + loser[0].name + "<\/strong>."; //Just print out their name
				
			} else if (loser.length === 2){ //Or, If there are two losers:
				msg += "Count and enter preference votes from both <strong>" + loser[0].name +  "<\/strong> and <strong>" + loser[1].name + "<\/strong>.<\/em>"; //Print name 1, followd by 'and', then name 2
			} else if (loser.length > 2){ //Otherwise, If there's more than 2 winners:
				msg += "Count and enter preference votes from  "; //(Set up a variable to hold the message)
				for (k = 0; k < (loser.length - 2); k++){ // Go through all names, except the last two
					msg += "<strong>" + loser[k].name + "<\/strong>, "; //Write them out with a comma between them
				}
				msg += "<strong>" + loser[loser.length - 2].name + "<\/strong> and <strong>" + loser[loser.length - 1].name + "<\/strong>."; //Then add the last two with 'and' between them
			}
			
			document.getElementById("output").innerHTML = msg; //Print out that message 
			
			for (var k = 0; k < cand.length; k++){//Run for each candidate in the array
			
				//Disable inputs
				document.getElementById('ir_vote_table').rows[k+1].cells[0].getElementsByTagName('input')[0].disabled = true;
				document.getElementById('ir_vote_table').rows[k+1].cells[1].getElementsByTagName('input')[0].disabled = true;
				
				//Add percentages to the table
				document.getElementById('ir_vote_table').rows[k+1].deleteCell(2);
				document.getElementById('ir_vote_table').rows[k+1].insertCell(2).innerHTML = "<em>(" + ((cand[k].score/totalVotes)*100).toFixed(2) + "%)<\/em>";
				
				//Add preferences column to the table
				if (loserNo.indexOf(k) < 0 && out.indexOf(k) < 0){ //If they are still in, put the next input in
					document.getElementById('ir_vote_table').rows[k+1].insertCell(vround_num+2).innerHTML = '<input type="number" name="ir_can' + k + '_round' + vround_num + '" id="ir_can' + k + '_round' + vround_num + '">';
				} else if (loserNo.indexOf(k) < 0){ //If they aren't just out, leave them blank
					document.getElementById('ir_vote_table').rows[k+1].insertCell(vround_num+2).innerHTML = "&nbsp;";
					document.getElementById('ir_vote_table').rows[k+1].cells[vround_num+2].className = "blank_cell";
				} else { //If they *just* got out, show some arrows
					if (document.getElementById('ir_vote_table').rows[k+1].rowIndex == 1) { //If it's at the top, only show a down arrow
						document.getElementById('ir_vote_table').rows[k+1].insertCell(vround_num+2).innerHTML = '<div class="small" id="Xir_can' + k + '_round' + vround_num + '">&#10549;</div>';
						document.getElementById('ir_vote_table').rows[k+1].cells[vround_num+2].className = "blank_cell";
					} else if (document.getElementById('ir_vote_table').rows[k+1].rowIndex == cand.length){ //If it's at the bottom, only show an up arrow
						document.getElementById('ir_vote_table').rows[k+1].insertCell(vround_num+2).innerHTML = '<div class="small" id="Xir_can' + k + '_round' + vround_num + '">&#10548;</div>';
						document.getElementById('ir_vote_table').rows[k+1].cells[vround_num+2].className = "blank_cell";
					} else { //Otherwise, it's in the midde - show up and down arrows
						document.getElementById('ir_vote_table').rows[k+1].insertCell(vround_num+2).innerHTML = '<div class="small" id="Xir_can' + k + '_round' + vround_num + '">&#10548;<br>&#10549;</div>';
						document.getElementById('ir_vote_table').rows[k+1].cells[vround_num+2].className = "blank_cell";
					}
				}
				
			}
			
		}

	function ir_winner(){ //Print the output
		//Add percentages to the table
		for (var k = 0; k < cand.length; k++){//Run for each candidate in the array
			document.getElementById('ir_vote_table').rows[k+1].deleteCell(2);
			document.getElementById('ir_vote_table').rows[k+1].insertCell(2).innerHTML = "<em>(" + ((cand[k].score/totalVotes)*100).toFixed(2) + "%)<\/em>";
		}
		
		//Print out the winner
		if (winner.length === 1){ //If there's only one winner:
			document.getElementById("output").innerHTML = "<em><strong>" + winner[0].name + "</strong> has won with <strong>" + winner[0].score + "</strong> votes (" + ((winner[0].score/totalVotes)*100).toFixed(2) + "%)<\/em>"; //Just print out their name
			
		} else if (winner.length === 2){ //Or, If there are two winners:
			document.getElementById("output").innerHTML = "<em><strong>" + winner[0].name + "</strong> and <strong>" + winner[1].name + "</strong> have tied with <strong>" + winner[0].score + "</strong> votes (" + ((winner[0].score/totalVotes)*100).toFixed(2) + "%) each"; //Print name 1, followd by 'and', then name 2
			
		} else if (winner.length > 2){ //Otherwise, If there's more than 2 winners:
			var msg = ""; //(Set up a variable to hold the message)
			for (k = 0; k < (winner.length - 2); k++){ // Go through all names, except the last two
				msg += "<strong>" + winner[k].name + "</strong>, "; //Write them out with a comma between them
			}
			msg += "<strong>" + winner[winner.length - 2].name + "</strong> and <strong>" + winner[winner.length - 1].name + "</strong> have tied with <strong>" + winner[0].score + "</strong> votes (" + ((winner[0].score/totalVotes)*100).toFixed(2) + "%) each"; //Then add the last two with 'and' between them
			document.getElementById("output").innerHTML = "<em>" + msg + "</em>"; //Then print that out
		}
	  
		if (document.body.offsetHeight> innerHeight){ //If the webpage is bigger than the browser window (if there's a vertical scroll bar):
			vis('scroll_to_result', 'disp'); //Display some navigation buttons
			vis('scroll_to_top', 'disp');
		}
		
		
		vis('results', 'disp'); //Display the results section
		document.getElementById("results").scrollIntoView(true); //Scroll down to the output
		
					
		// Fancy Google Chart!
		// Set a callback to run when the Google Visualization API is loaded.
		google.charts.setOnLoadCallback(drawChart);
		// Callback that creates and populates a data table, instantiates the chart, passes in the data and draws it.
		function drawChart() {
			// Create the data table.
			var data = new google.visualization.DataTable();
			data.addColumn('string', 'Candidate');
			data.addColumn('number', 'Votes');
			data.addRows(DataForChart);
	
			// Set chart options
			var options = {'width':400, 'height':250};
	
			// Instantiate and draw our chart, passing in some options.
			var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
			chart.draw(data, options);
		}
		vis('chart_div', 'disp'); //Display the chart
	}
}
