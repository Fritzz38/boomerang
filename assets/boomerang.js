$(document).ready(function() {
    var city = "phoenix";
    var occupation = "junior+web+developer";
    var email = "";
    var password = "";
    var userId = "anonymous";
    var signInDiv = $("#userEmail");
    var signOutDiv = $("#userSignOut");
    var ListOfCities = ["Phoenix",
        "Albuquerque", "Anchorage", "Asheville", "Atlanta", "Austin",
        "Birmingham, AL", "Boise", "Boston", "Boulder", "Bozeman",
        "Buffalo", "Charleston", "Charlotte", "Chattanooga",
        "Chicago", "Cincinnati", "Cleveland", "Colorado Springs", "Columbus",
        "Dallas", "Denver", "Des Moines", "Detroit", "Eugene", "Fort Collins",
        "Honolulu", "Houston", "Indianapolis",
        "Jacksonville", "Kansas City", "Knoxville", "Las Vegas",
        "Los Angeles", "Louisville", "Madison", "Memphis",
        "Miami", "Milwaukee", "Minneapolis-Saint Paul", "Nashville",
        "New Orleans", "New York", "Oklahoma City", "Omaha",
        "Orlando", "Palo Alto", "Philadelphia",
        "Pittsburgh", "Portland, ME", "Portland, OR",
        "Providence", "Raleigh", "Richmond", "Rochester",
        "Salt Lake City", "San Antonio", "San Diego", "San Francisco Bay Area",
        "San Juan", "San Luis Obispo", "Seattle",
        "St Louis", "Tampa Bay Area", "Washington DC",
    ];

    var cityCategoryTitles = []; // pushed from teleport
    var cityData = []; // also from teleport
    var barColorArray = []; // to hold rgb values for chartjs
    var borderColorArray = []; // holds rgb values for the border color of each bar in chart
    var unformattedCity = "Phoenix";

    var config = {
        apiKey: "AIzaSyCRKdQPHdR5FR3XJUXwXhlNw7p6ylOsbz8",
        authDomain: "bacon-525e9.firebaseapp.com",
        databaseURL: "https://bacon-525e9.firebaseio.com",
        projectId: "bacon-525e9",
        storageBucket: "bacon-525e9.appspot.com",
        messagingSenderId: "724409226390"
    };
    firebase.initializeApp(config);
    var database = firebase.database();

    //***************************Functions**************************************

    function makeTeleportAjaxRequest() {
        // this api gets the city scores from teleport - no key needed
        var cityscoresURL = "https://api.teleport.org/api/urban_areas/slug:" + city + "/scores/";
        $('#myChart').empty();
        //resets the arrays 
        cityCategoryTitles.length = 0;
        cityData.length = 0;
        barColorArray.length = 0;
        borderColorArray.length = 0;
        $.ajax({
            url: cityscoresURL,
            method: "GET"
        }).done(function(response) {
            // console.log(response);
            //empties the containing div
            $('#resultsOne').empty();
            //loops through the categories and formats the scores
            for (var j = 0; j < response.categories.length; j++) {
                var categoryTitle = response.categories[j].name;
                cityCategoryTitles.push(categoryTitle);
                var categoryScore = response.categories[j].score_out_of_10;
                var newCatScore = categoryScore.toFixed(1);
                cityData.push(newCatScore);
                //pushes rgb codes to an array for each score              
                if (newCatScore > 6.9) {
                    barColorArray.push('rgb(183, 249, 154)');
                    borderColorArray.push('rgb(34, 137, 98)');
                } else if (newCatScore < 4.0) {
                    barColorArray.push('rgb(255,177,193)');
                    borderColorArray.push('rgb(109, 1, 17)');
                } else {
                    barColorArray.push('rgb(154,208,245)');
                    borderColorArray.push('rgb(9, 75, 122)');
                }
            }
            makeChart(); //function that makes the chartjs chart
        });
    }

    function getImage() {
        //gets a city image from teleport and puts it in the header
        var imageURL = "https://api.teleport.org/api/urban_areas/slug:" + city + "/images/"
        $.ajax({
            url: imageURL,
            method: "GET"
        }).done(function(response) {
            // console.log(response);
            var picURL = response.photos[0].image.web;
            $('.header').css('background-image', 'url(' + picURL + ')');
        });
    }

    function makeSalaryAjaxRequest() {
        //teleport has a separate api for salaries
        var salaryURL = "https://api.teleport.org/api/urban_areas/slug:" + city + "/salaries/";
        $.ajax({
            url: salaryURL,
            method: "GET"
        }).done(function(response) {
            //I used the position in the array for web developer             
            var newJobTitle = response.salaries[51].job.title;
            var salary = response.salaries[51].salary_percentiles.percentile_50;
            var roundedSalary = salary.toFixed(0);
            // console.log(roundedSalary);
            $('#salary').html("Median " + newJobTitle + " Salary:   $" + roundedSalary);
        });
    }

    function getPriceOfBeer() {
        var beerURL = "https://api.teleport.org/api/urban_areas/slug:" + city + "/details/";
        $.ajax({
            url: beerURL,
            method: "GET"
        }).done(function(response) {
            // console.log(response);
            var beerArray = response.categories[3].data;
            for (var z = 0; z < beerArray.length; z++) {
                if (beerArray[z].id === "COST-IMPORT-BEER") {
                    var beerPriceX = beerArray[z].currency_dollar_value;
                    var beerPrice = beerPriceX.toFixed(2);
                    $('#beer').html("Avg. Price of Beer:  $" + beerPrice);
                }
            }
            var tempArray = response.categories[2].data;
            for (var x = 0; x < tempArray.length; x++) {
                if (tempArray[x].id === "WEATHER-AVERAGE-HIGH") {
                    var avgHighC = response.categories[2].data[x].string_value;
                    var avgHighF = Math.round(avgHighC * 9 / 5 + 32);
                    $('#temp').html("Avg. Temperature High: " + avgHighF + " " + String.fromCharCode(176) + "F");
                }
            }
        });
    }

    function makeIndeedAjaxRequest() {
        // this URL has james's Indeed.com publisher key
        // you need format=json, and the version v=2 in the URL
        // I set the # of results to 5 but we can change it
        // if you get ERR_BLOCKED_BY_CLIENT it is probably because of adblockers
        newQueryURL = "https://api.indeed.com/ads/apisearch?publisher=1107022713091933&format=json&q=" + occupation + "&l=" + city + "&limit=5&v=2";
        $.ajax({
            url: newQueryURL,
            method: "GET",
            //without the dataType key and value, the response is not a json object that we can use
            dataType: 'jsonp',
            // this crossDomain key eliminated the need for the cross origin chrome extension
            crossDomain: true
        }).done(function(response) {
            console.log(response);
            var numberOfResults = response.totalResults;
            $('.resultsTwo').empty()
            var newLabel = $('<label class="jobsLabel"></label>');
            newLabel.html("<strong>Job Listings:  " + numberOfResults + "</strong>");
            $('.resultsTwo').append(newLabel);
            for (var i = 0; i < 5; i++) {
                var jobTitle = response.results[i].jobtitle;
                var company = response.results[i].company;
                var jobUrl = response.results[i].url;
                var snippet = response.results[i].snippet;
                var IndeedCity = response.results[i].city;
                var IndeedState = response.results[i].state;


                //create a bootstrap well
                var newWell = $('<div class="well"></div>');
                //put the jobtitle in the well
                // newWell.html(jobTitle).val(jobTitle);
                newWell.html("<strong>Title: </strong>" + jobTitle);
                newWell.append("<br>" + "<strong>Company: </strong>" + company);
                newWell.append("<br>" + "<a href=" + jobUrl + ' target="_blank">Link to job' + "</a>");
                newWell.append("<br>" + "<strong>Description: </strong>" + snippet);
                newWell.append("<br>" + "<strong>Location:  </strong>" + IndeedCity + ", " + IndeedState);
                //put the well in the results container

                $('.resultsTwo').append(newWell);

            }
        });
    }

    function getJobsFromFirebase() {
        var newLabel_2 = $('<label class="savedLabel"></label>');
        newLabel_2.html("<strong>Saved Jobs - Drag Here to Save</strong>");
        $("#savedJobs").append(newLabel_2);

        database.ref('jobs/' + userId + '/').on("child_added", function(snapshot) {
            console.log(userId);
            var storedJobs = snapshot.val();
            //sets the firebase generated pushID to FbKey
            var FbKey = snapshot.key;
            var storedJobTitle = storedJobs.jobTitle;
            // console.log(FbKey);
            console.log("fbkey inside jobs child added   " + FbKey);
            var newJobWell = $('<div class="well"></div>');
            // newJobWell.html(storedJobs);
            newJobWell.html(storedJobTitle);
            //adds a remove button to each jobwell
            var removeButton = $('<br><button class="remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>');
            newJobWell.append(removeButton);
            //gets the firebase key so we can remove the jobwell
            // var FbKey = snapshot.key;
            newJobWell.attr('value', FbKey);
            $('#savedJobs').append(newJobWell);
        });
    }

    function signOutFromFirebase() {
        $('#savedJobs').empty();
        database.ref('users').update({
            userId: "anonymous"
        });
        firebase.auth().signOut();
        signInDiv.hide();
        signOutDiv.show();
    }

    //**************Chartjs******************************
    //had to reset the canvas to get rid of flicker
    function makeChart() {
        $('#chart').empty().show();
        var newCanvas = $('<canvas id="myChart" height="60px"></canvas>');
        $('#chart').html(newCanvas);
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'bar',
            data: {
                labels: cityCategoryTitles,
                datasets: [{
                    label: unformattedCity,
                    backgroundColor: barColorArray,
                    borderColor: borderColorArray,
                    borderWidth: 1,
                    data: cityData,
                }]
            },
            options: {
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            autoSkip: false
                                // this will make the x axis start at 0
                                // beginAtZero: true
                        },
                        barPercentage: 0.7
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }

    // when a user logs on, the email username (before the @) is stored in firebase as userId
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            email = user.email;
            userId = email.split("@")[0];
            $("#welcome").html("Welcome, " + userId);
            signInDiv.hide();
            signOutDiv.show();
            database.ref('users').update({
                userId: userId
            });
            console.log("logged in");
        } else {
            signInDiv.show();
            signOutDiv.hide();
            // No user is signed in.
        }
    });

    //when the userId in firebase is updated above....
    database.ref('users').on("child_changed", function(response) {
        // local userId is updated with the firebase userId
        userId = response.val();
        console.log("userId in users child added    " + userId);
        $('#savedJobs').empty();
        getJobsFromFirebase();
    });

    $('#cityInfo').show();
    $('#jobInfo').hide();
    // $('#signOut').hide();
    signOutDiv.hide();
    // firebase.auth().signOut(); //signs out any user when page loads
    signOutFromFirebase();
    getJobsFromFirebase();
    makeTeleportAjaxRequest();
    makeIndeedAjaxRequest();
    makeSalaryAjaxRequest();
    getPriceOfBeer();
    getImage();



    $("#logIn").on("click", function() {
        email = $("#email").val().trim();
        password = $("#password").val().trim();
        signInDiv.hide();
        signOutDiv.show();
        //logs in to firebase
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("code:" + errorCode);
            var modal = $('#myModal');
            var span = $('.close');

            if (errorCode === "auth/wrong-password") {
                $('#errorMessage').html('Wrong Password  ');
            } else if (errorCode === "auth/user-not-found") {
                $('#errorMessage').html('User not found  ');
            }
            else if (errorCode === "auth/invalid-email") {
                $('#errorMessage').html('Invalid Email  ');
            }
            else {
                $('#errorMessage').html('Nope  ');
            }
            signInDiv.show();
            signOutDiv.hide();

            modal.show();
            span.on('click', function() {
                modal.hide();

            });
            
        });
        $("#email").val("");
        $("#password").val("");

    });

    $("#password").keyup(function(event) {
        if (event.keyCode == 13) {
            $("#logIn").click();
            $('#password').val("");
            $('#email').val("");
        }
    });

    $("#signOut").on("click", function() {
        signOutFromFirebase();
    });

    //  Remove saved jobs from firebase and from the 'savedJobs' container
    // 'this' is the button clicked
    $("#savedJobs").on("click", '.remove', function() {
        var parentWell = $(this).parent();
        console.log(parentWell);
        var FirebaseKey = parentWell.attr('value');
        console.log('jobs/' + userId + '/');
        console.log('jobs/' + userId + '/' + FirebaseKey);
        database.ref('jobs/' + userId + '/' + FirebaseKey).remove();
        parentWell.remove();
    });

    //when submit button is clicked, run all of the searches
    $("#searches").on('click', function() {
        unformattedCity = $("#searchInput option:selected").text();
        lowercaseCity = unformattedCity.toLowerCase();
        cityX = lowercaseCity.replace(/ /g, "-");
        city = cityX.replace(/,/g, "");
        occupation = "junior+web+developer";
        makeTeleportAjaxRequest();
        makeIndeedAjaxRequest();
        makeSalaryAjaxRequest();
        getPriceOfBeer();
        getImage();
        // $("#toggle").show();
        $("#cityInfo").show();
        $('#jobInfo').hide();
    });

    //Show/Hide the city info with the button created once the search on click runs
    $("#toggle").on('click', function() {
        if ($("#cityInfo").is(":visible")) {
            $("#cityInfo").hide();
            $('#jobInfo').show();
        } else {
            $("#cityInfo").show();
            $('#jobInfo').hide();
        };
    });

    //creates the drop down menu
    for (k = 0; k < ListOfCities.length; k++) {
        var newOptions = $("<option></option>");
        newOptions.attr("value", ListOfCities[k]);
        newOptions.html(ListOfCities[k]);
        $("#searchInput").append(newOptions);
    };
    //******************************Dragula code*****************************************
    dragula([document.getElementById('resultsTwo'), document.getElementById('savedJobs')])
        .on('drop', function(el, target, source) {
            if (target != source && source === document.getElementById('resultsTwo')) {
                var draggedWell = $(el).html();

                database.ref('jobs/' + userId + '/').push({
                    jobTitle: draggedWell
                });
                $(el).remove();
            } else if (source === document.getElementById('savedJobs') && target != source) {
                var draggedWell = $(el);
                console.log(el);
                var FirebaseKey = draggedWell.attr('value');
                database.ref('jobs/' + userId + '/' + FirebaseKey).remove();
                $(el).remove();
            }
        });
    //*****************************************************************************************

});
