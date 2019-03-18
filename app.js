var budgetController = (function(){

	var Expense = function(id, description, value){

		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;

	}

	var Income = function(id, description, value){

		this.id = id;
		this.description = description;
		this.value = value;

	}

	Expense.prototype.calcPercentage = function(totalInc){
        
        if(totalInc > 0){

			this.percentage = Math.round((this.value/totalInc) * 100);
        } else {

        	this.percentage = -1;
        }
	}
    
    Expense.prototype.getPercentage  = function(){

    	return this.percentage;
    }


	var data = {

		allItems: {

			exp: [],
			inc: [],

		},

		total:{

			exp: 0,
			inc: 0
		},

		budget : 0,
		percentage: -1
	}

	var calculateTotal = function(type){

		let sum = 0;
		data.allItems[type].forEach(function(el){

			sum += el.value;
		})
		data.total[type] = sum;
	}


	return {

		addItem: function(type, des, val){
            var newItem;
            
            //[1 2 3 4 5, next ID = 6]
            //suppose you delete an el
            //[1 2 4 6 8, next ID = 9]
            //ID = last ID + 1
            
            if(data.allItems[type].length > 0){

	            ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // -1 coz array is 0 based.
            } else {

            	ID = 0;
            }
            
            // create new item based on inc or exp
            if(type === "exp"){

				newItem = new Expense(ID, des, val)

            } else {

            	newItem = new Income(ID, des, val)
            }
            
            // push it into our data structure 
            data.allItems[type].push(newItem);
            return newItem;
		},

		deleteItem: function(type, id){
           
          var index, ids;

          ids = data.allItems[type].map(function(e){

	          	return e.id;
          });

          index = ids.indexOf(id)

          if(index !== -1){

	          	data.allItems[type].splice(index, 1);
          }

		},

		calculateBudget: function(){

			//calculate total inc and exp
			calculateTotal("exp")
			calculateTotal("inc")

			// calc the budget: inc - exp
			data.budget = data.total.inc - data.total.exp;

			// calc the percentage of inc that we spent
			if(data.total.inc > 0){

				data.percentage = Math.round((data.total.exp/data.total.inc) * 100);

			} else {

				data.percentage = -1;
			}

			// Exp = 100; Inc = 200; spent 50% = 100/200 = 0.5 * 100
		},

		calculatePercentges: function(){

			data.allItems.exp.forEach(function(e){

				e.calcPercentage(data.total.inc)
			})
		},

		getPercentages: function(e){

			var allPerc = data.allItems.exp.map(function(e){

				return e.getPercentage();
			})

			return allPerc;
		},

		getBudget: function(){

			return {

				budget: data.budget,
				totalInc: data.total.inc,
				totalExp: data.total.exp,
				percentage: data.percentage
			}
		},

		test: function (){

			console.log(data)
		}
	}

})();

var UiController = (function(){

	var DomStrings = {

		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		inputBtn: ".add__btn",
		budgetLabel: ".budget__value",
		IncLabel: ".budget__income--value",
		ExpLabel: ".budget__expenses--value",
		container: ".container",
		percentageLabel: ".budget__expenses--percentage",
		expensesPercentagelabel: ".item__percentage",
		dateLabel: ".budget__title--month"

	};

	var formateNumber =  function(num, type){

            var numSplit, int, dec, sign;
		   	num = Math.abs(num);
		   	num = num.toFixed(2);

		   	numSplit = num.split(".")
		   	int = numSplit[0]

		   	if(int.length > 3){

		   		int = int.substr(0,int.length - 3) + "," + int.substr(int.length - 3, 3);
                
		   	}

		   	dec = numSplit[1]

		   	type === "exp" ? sign = "-" : sign = "+";

		   	return `${sign} ${int}.${dec}`;

	   }

	   var nodeListForEach = function(list, callBack){

	    	for(var i = 0; i < list.length; i++){

	    		callBack(list[i], i);
	    	}
	    }

   return {

	   getInput: function(){

		   	return {

			   	type: document.querySelector(DomStrings.inputType).value, //Will be inc or exp
			   	description: document.querySelector(DomStrings.inputDescription).value,
			   	value: parseFloat(document.querySelector(DomStrings.inputValue).value)
		   	}
	   },

	   addListItem: function(obj, type){

	   	var html, newHTML, element;
        

        //Create HTML string with placeholder text
	   	if(type === "inc"){

            element = DomStrings.incomeContainer;
	   		html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

	   	} else if(type === "exp"){ 

            element = DomStrings.expensesContainer;
	   		html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
	   	}

		//Replace the placeholder text with some actual data
		newHTML = html.replace("%id%", obj.id)
		newHTML = newHTML.replace("%description%", obj.description)
		newHTML = newHTML.replace("%value%", formateNumber(obj.value, type))

		// Insert the HTML into the DOM
		document.querySelector(element).insertAdjacentHTML("beforeend", newHTML)

	   },

	   deleteListItem: function(slectorID){

		   	var el = document.getElementById(slectorID);
		   	el.parentNode.removeChild(el);
	   },

	   clearFlieds: function(){

		   	var fields, fieldsArr;
		   	fields = document.querySelectorAll(DomStrings.inputValue+", " + DomStrings.inputDescription);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(el, i, arr){

            	el.value = "";
            });
	   },

	   displayBudget: function(obj){
          
	        var type;
	        obj.budget > 0 ? type = "inc" : type = "exp"
		   	document.querySelector(DomStrings.budgetLabel).textContent = formateNumber(obj.budget, type) ;
		   	document.querySelector(DomStrings.IncLabel).textContent = formateNumber(obj.totalInc, "inc");
		   	document.querySelector(DomStrings.ExpLabel).textContent = formateNumber(obj.totalExp, "exp");

            if(obj.percentage >= 0){
			   	document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + "%";
			} else {
			   	document.querySelector(DomStrings.percentageLabel).textContent = "---";
			}
	   },

	   displayPercentages: function(percentage){

		   	var fields = document.querySelectorAll(DomStrings.expensesPercentagelabel)

		    

		    nodeListForEach(fields, function(e,i){
              
	              if(percentage[i] > 0){

			    	 e.textContent = percentage[i] + "%";

	              } else {

	              	e.textContent = "---"
	              }
		    });
	   },

	   displayMonth: function(){
            var now, year, month;
		   	now = new Date();
		   	var months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "November", "December"]
		   	// var christmas = new Date(2016, 11, 25);
		   	month = now.getMonth()
		   	year = now.getFullYear();
		   	document.querySelector(DomStrings.dateLabel).textContent = months[month] + " " + year;

	   },

	   getDomStrings: function(){

		   	return DomStrings;
	   },

	   changeType: function(type){

		   	var fields = document.querySelectorAll(
		   		DomStrings.inputType + "," + 
		   		DomStrings.inputDescription + "," + 
		   		DomStrings.inputValue)

		   	nodeListForEach(fields, function(e){
                
		   		e.classList.toggle("red-focus");
		   	})

		   	document.querySelector(DomStrings.inputBtn).classList.toggle("red");

	   }
   }

})()


var controller = (function(budgetControl, UiControl){


	var setUpEventListener = function(){

	    var DOM = UiControl.getDomStrings();

		document.querySelector(DOM.inputBtn).addEventListener("click", 	ctlAddItem)

	    document.addEventListener("keypress", function(e){

	    	if(e.keyCode === 13){

	    		ctlAddItem()
	    	}
	    });

	    document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem)
        document.querySelector(DOM.inputType).addEventListener("change", UiControl.changeType);
	}


	var updateBudget = function(){

		//1. Calculate the budget
		budgetControl.calculateBudget()

		//2. Return the bidget
		var budget = budgetControl.getBudget();
		console.log(budget);

		//3. Display the budget on the UI
		UiControl.displayBudget(budget)
	}

	var updatePercentages= function(){

		// 1. Calc perc
		budgetControl.calculatePercentges()


		// 2. Read perct from the budget controller
		var percentage = budgetControl.getPercentages()
		console.log(percentage)

		// 3. Update the UI with the new perc
		UiControl.displayPercentages(percentage);
	}

	var ctlAddItem = function(){
        var input, newItem;
		//1. Get the field input data
		input = UiControl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){

        	//2. Add the item to the budget controller
	    	newItem = budgetController.addItem(input.type, input.description, input.value)

	    	//3. Add the item to the UI
	    	UiControl.addListItem(newItem, input.type)

	    	//4. Clear the fields
	    	UiControl.clearFlieds();
	        
	    	//5. Calculate and update budget
	    	updateBudget()


	    	// UiControl.displayBudget(budgetControl.getBudget())
            //
	    	updatePercentages()

        }
   	}

   	var ctrlDeleteItem = function (e){
        
        var itemID, splitID, type, ID;
   		itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
   		console.log(itemID)

   		if(itemID){

   			splitID = itemID.split("-");
   			type = splitID[0]
   			ID = splitID[1]

   			//1. Delete item from dta structure
   			budgetControl.deleteItem(type, parseInt(ID))

   			//2. delete item from user inter
   			// e.target.parentNode.parentNode.parentNode.parentNode.remove()
   			UiControl.deleteListItem(itemID)

   			//3. Update and show the new budget
   			updateBudget()

   			updatePercentages()
   		}
   	}

	return {

		init: function(){

			console.log("Application has started")
			UiControl.displayMonth();
			UiControl.displayBudget({

				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			})

			setUpEventListener();
		}
	}

})(budgetController, UiController);

controller.init();


