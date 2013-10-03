//will document ready improve load time issue
// "2012-09-23"
// "2012-10-27
// {"headline": "Jil Sander: Minimalism With a Kick", "timestamp": "2012-09-23 09:09:27", "section": "Style", "word_count": "392", "blog_post": 1},

$(document).ready(function() {

d3.json("./data/fulldata.json", function(error, data) {
  if (error) return console.log("there was an error loading the data: " + error);
  console.log("there are " + data.length + " elements in my dataset");

var narrow = 1.5; //normal rect width
var thick = 4; //thickness for highlighting, mouseovers
var lmargin = 15; //left margin
togglewidth = 1500; //svg toggle boxes width
toggleheight = 30; //svg toggle boxes height
textmargin = 5; //text justifications

var sections = ["Fashion & Style", "Business", "N.Y. / Region","World","Opinion","Home & Garden","Magazine","Travel","Dining & Wine","Arts","Books","Movies","Theater","Technology","Science","Health","Sports","U.S.","Education","Real Estate","Automobiles"]
//this is the color palette
var colors = ["#EC1162", "#31C26C", "#008636", "#FFD03F", "#F26868", "#EE6B9C", "#D81921", "#A72958", "#901838","#8A3192","#AE90B5","#AE7380","#AD68AB","#34489D","#34489D","#3B4676","#313186", "#F26A26","#196438","#005723","#D0A22A","#A5802D"]

//////////////a series of functions to get useful info out of the data
//this function returns a more simply formatted date than what's in the data initially
var dateAdjust = function(date){
  var t = date.replace("-", "/");
  var ti = t.replace("-","/");
  var tim = ti.replace("T"," ");
  return tim;
}
//what is the minimum date?
var mindate = d3.min(data.days, function(d,i){ 
  var dateis = dateAdjust(d.date)
    return d3.time.day(new Date(dateis));
})
//what is the difference between the date of this object and the minimum date?
var dateDiff = function(date, minDate) {
  var norm = dateAdjust(date);
  return (d3.time.day(new Date(norm))-minDate)/864e5;
}
//what hour is it?
function hourInfo(date){
  var norm = dateAdjust(date);
  var d = new Date(norm);
  var h = d.getHours();
  return h;
 }
// what minute is it?
function minuteInfo(date){
  var norm = dateAdjust(date);
  var d = new Date(norm);
  var m = d.getMinutes();
  return m;
 }
//what day has the biggest total of articles? we are in the first tier of the data here - data.days
var maxtotal = d3.max(data.days, function(d,i){
    return d.total; 
  });

//converting hours and minutes to degrees
var hScale = d3.scale.linear()
  .domain([0, 24]) 
  .range([-180, 180]);
var mScale = d3.scale.linear()
.domain([0, 60]) 
.range([0, 1]);

//mapping line height to svg element size dimensions
//considering a maxwords article of approx. 2,000
var heightScale = d3.scale.linear()
  .domain([0, 2000])
  .range([maxtotal/20, maxtotal/6]);

//this is the svg that contains the blog toggle box 
var blogsvg = d3.select("#toggleBlogs").append("svg")
.attr("width", 100)
.attr("height", 20);
//this is the svg that contains the section toggle box
var sectionview = d3.select("#toggleSections").append("svg")
.attr("width", 250)
.attr("height", 25);
//svg contains the laid out sections across the screen
var sectionlayout = d3.select("#allSections").append("svg")
.attr("width", togglewidth)
.attr("height", toggleheight)
// .attr('class','sectionnames');
//svg contains each radial and totals circle
//width and height are related to the max total articles 
var chart = d3.select("#small_multiples").selectAll("svg").append("svg")
// var chart = d3.select("#small_multiples").append("svg")
.data(data.days)
.enter().append("svg")
.attr("width", maxtotal/2)
.attr("height", maxtotal/2);

  var displayBlogs = true; 
  var displayAllSections = true;
//here we attach the text for the toggles
var sectionToggle = sectionview.append("text")
.attr("x", lmargin)
.attr("y", toggleheight-textmargin)
.attr('fill','grey')
.attr('class','toggle')
    .text(function(){ return 'sections: ' + (displayAllSections ? 'all' : 'highlight') })


//here we attach the text for the toggles
var blogToggleOn = blogsvg.append("text")
.attr("x", lmargin)
.attr("y", textmargin*2)
.attr('fill','grey')
.attr('class','toggle')
// .text("blogs:");
    .text(function(){ return 'blogs: ' + (displayBlogs ? 'on' : 'off') })

//let's draw all the thin rectangles for the radials
rect()
var rect = chart.selectAll("rect")
function rect(){
  var rect = chart.selectAll("rect")
  .data(function(d){ return d.articles })
  .enter().append("rect")
    .attr("class", function(d,i){
      //this appends the article's section as a class for that specific article/rectangle
      var section = (d3.values(d.section).join(""))
      return section;
  })
  .attr("x", function(d,i){
    //calculate where x will be based on what the date is - gridding here
    var timestamp = (d3.values(d.timestamp).join(""));
      return (maxtotal/4+(Math.floor(dateDiff(timestamp, mindate)%7))); 
    })
  .attr("y", function(d,i){ 
    //calculate where y will be based on what the date is - gridding here
    var timestamp = (d3.values(d.timestamp).join(""));
      return (maxtotal/4+Math.floor(dateDiff(timestamp, mindate)/7))
    })     
    //default width will be narrow
  .attr("width", narrow)
  .attr("height", function(d,i){ 
    var word = (d3.values(d.word_count).join(""))
    var wordis = parseInt(word) //making an integer out of the wordcount
    return heightScale(wordis);
    })
  .attr("transform", function(d,i){
    //here we have the magic rotation that spins each rectangle the correct degree / position according to its publishing time of day
    //in my experimentation, it seems you must always set the x and y during this transform - and that they have to be the same as the above x and y
    var timestamp = (d3.values(d.timestamp).join(""))
    var hello = hourInfo(timestamp);
    var min = minuteInfo(timestamp);
    //it's important to convert the hours AND minutes to degrees (the hScale function looks at the hours AND the mScaled minutes - mScale goes 0 to 1)
    return "rotate("+(hScale(hello+mScale(min)))+","+(maxtotal/4+(Math.floor(dateDiff(timestamp, mindate)%7)))+", "+(maxtotal/4+Math.floor(dateDiff(timestamp, mindate)/7))+")"
    })
  .attr("opacity", function(d,i){  
    if(d.blog_post===1){ 
    return .3;  //initially set blog posts to low opacity, then the toggle brightens them up
    } 
    else if(d.blog_post===0){ 
    return 1; 
    }
    })
  .attr("fill", function(d, i){
    if (d.blog_post===1){ 
    return "grey";
    } 
    //look through all the sections and match them up with their special colors
    for (var s = 0; s<sections.length; s++){
    var section = (d3.values(d.section).join(""))
    if (section===sections[s]){
        return colors[s];
    }
    }
    })
  .on('mouseover', function(d,i){
    d3.select(this)
    //change the width of the mousedover rectangle to thick
    .attr("width",thick*2)
    })
  .on('mouseout', function(d,i){
    d3.select(this)
    .attr("width", narrow)
    });
//call circle function / total circles after you are finished drawing all rectangle lines
circ();
// text();
}
//special jquery library for a nice mouseover headline / title per rectangle
 $('rect').tipsy({ 
        gravity: 'nw', 
        html: true, 
        //fade: true,
        title: function() {
          var d = this.__data__;
          return d.headline+" ("+d.section+")";
        }
      });

var b=0;
var a=0;
blogToggleOn.on('click', function(d,i) {
  console.log("toggleOn")
    if (a===0){
      displayBlogs = false;
      console.log(displayBlogs);
      //highlight blogs
      lookBlogs()

      d3.select(this)
        .text(function(){ return 'blogs: ' + (displayBlogs ? 'on' : 'only') })
        // .style('background', function(){ return (displayBlogs ? blogColor : 'inherit') })
        .style('color', function(){ return (displayBlogs ? 'white' : 'black') })
 
    }
    else if (a===1){
      displayBlogs = true;
      console.log(displayBlogs);
      //go back to normal view
      goback();
      d3.select(this)
        .text(function(){ return 'blogs: ' + (displayBlogs ? 'on' : 'only') })
        // .style('background', function(){ return (displayBlogs ? blogColor : 'inherit') })
        .style('color', function(){ return (displayBlogs ? 'white' : 'black') })
    } 
})
sectionToggle.on('click', function(d,i) {
  console.log("sectiontoggleOn")
  if (b===0){
    //call the section names up
    displayAllSections = false;
          d3.select(this)
        .text(function(){ return 'sections: ' + (displayAllSections ? 'all' : 'highlight') })
        // .style('background', function(){ return (displayBlogs ? blogColor : 'inherit') })
        .style('color', function(){ return (displayAllSections ? 'white' : 'black') })
 
    sectNames();
    //show them slowly
        $("#allSections").show("slow",function(){
        })
    }
  else if (b===1){
    displayAllSections = true;
          d3.select(this)
        .text(function(){ return 'sections: ' + (displayAllSections ? 'all' : 'highlight') })
        // .style('background', function(){ return (displayBlogs ? blogColor : 'inherit') })
        .style('color', function(){ return (displayAllSections ? 'white' : 'black') })
 
    //if you click the section toggle button go back to the original visual
    goback();
    //and hide the section spread
      $("#allSections").hide("slow",function(){
      })
    }
})

function goback(){
  console.log("back")
  rect
    .transition()
  .attr("width", narrow)
  .attr("height", function(d,i){ 
    var word = (d3.values(d.word_count).join("")) //is something wrong here?
    var wordis = parseInt(word)
    return heightScale(wordis);
  })
    .ease("elastic", 10, .5)
  a=0;
  b=0;
 //circ();
}

function lookBlogs(){
  console.log("blog")
  rect
    .transition()
  .attr("width", function(d,i){
    if(d.blog_post===1){
      return thick;
    } else { 
      return narrow;
    }
  })
//here we make the height stay the same if you're a blog, but if you're not, shrivel away.
    .attr("height", function(d,i){ 
    var word = (d3.values(d.word_count).join(""))
    var wordis = parseInt(word)
       if(d.blog_post===1){
    return heightScale(wordis);
  }
  else {
    return 0.1;
  }
    })
    .ease("elastic", 10, .3)
//change boolean
    a=1;
}

//if a rectangle (/line) is clicked, execute the highlight function for that section
rect.on('click', function(d,i){
  var name = d.section;
  highlight(d.section);
})

//total circles
function circ(){
   var circle = chart.append("circle")
  .attr("stroke", "grey")
  .attr("fill", "white")
  .attr("cx", function(d,i){ 
    return (maxtotal/4+(Math.floor(dateDiff(d.date, mindate)%7))); 
  })//not maxtotal/2
  .attr("cy", function(d,i){ 
    return (maxtotal/4+Math.floor(dateDiff(d.date, mindate)/7));
  })    
  .attr("r", function(d,i){ return (d.total/18) });

  // var text = chart.append("text")
  // .attr("fill", "grey")
  // .attr("class", "h4")
  // .text(function(d){
  //   var timestamp = (d3.values(d.timestamp).join(""));
  //   return dateAdjust(d.date);  
  // })
  // .attr("x", function(d,i){ 
  //   return (maxtotal/4+(Math.floor(dateDiff(d.date, mindate)%7))); 
  // })//not maxtotal/2
  // .attr("y", function(d,i){ 
  //   return (maxtotal/2+Math.floor(dateDiff(d.date, mindate)/7));
  // })    
}

text();
function text(){
  var text = chart.append("text")
  // .attr("stroke", "grey")
  .attr("fill", "grey")
  .attr("class", "h4")
  .attr("font-size", "10")
  .text(function(d){
    var cleanDate = dateAdjust(d.date); 
    var d3Date = d3.time.day(new Date(cleanDate)); 
    var formatDate = d3.time.format("%b-%d-%Y");
    return formatDate(d3Date);
  })
  .attr("x", function(d,i){ 
    return (maxtotal/4+(Math.floor(dateDiff(d.date, mindate)%7))); 
  })//not maxtotal/2
  .attr("y", function(d,i){ 
    return (maxtotal/2.5+Math.floor(dateDiff(d.date, mindate)/7));
  });
  // console.log(d[0].date);
    // textToLeave(); 
};

function textToLeave(){
  var text = chart.append("text")
  // .attr("stroke", "grey")
  .attr("fill", "grey")
  .attr("class", "h4")
  .text(function(d){
    // console.log(data[0].date);  
    // console.log(d[0].date);  
    console.log(d.date[0]);  
  })
  // .attr("x", function(d,i){ 
  //   return (maxtotal/4+(Math.floor(dateDiff(data[0].date, mindate)%7))); 
  // })//not maxtotal/2
  // .attr("y", function(d,i){ 
  //   return (maxtotal/2.5+Math.floor(dateDiff(data[0].date, mindate)/7));
  // });
}

function highlight(sectionis){
rect
  .transition()
  .attr("width", function(d,i){
   if(d.section===sectionis){
    return thick;
  } else { 
    return narrow;
  }
})
  .attr("height", function(d,i){ 
    var word = (d3.values(d.word_count).join(""))
    var wordis = parseInt(word)
       if(d.section===sectionis){
    return heightScale(wordis);
  }
  else {
    return 0;
  }
    })
    .ease("elastic", 10, .3)
}

//this draws the section names and is aware of if you Mouse Over them - it highlights that section
function sectNames(){ 
  var sectNames = sectionlayout.selectAll("text").append("text") //select the sectionlayout SVG
  .data(sections) //we just go into the array called sections
  .enter().append("text")
   .style("font-size", "8pt")
  // .attr("class", function(d,i){
  //   return d;
  // })
  // .attr("class", sectNames)
 .attr("x", function(d,i){
  // return lmargin;
  // return lmargin+i*2;
  // var itsx = [lmargin+i*20]
  if (i>0){
  return lmargin+((i-1)*80)
}
else {
  return lmargin+i*60;
}
  })
 .attr("y", 15)
 .attr("fill", function(d,i){
    return colors[i];
    })
 .text(function(d,i){
    return d;
})
  .on('mouseover', function(d,i){
    d3.select(this)
    .style("opacity", "1")
    highlight(d);
})
  .on('mouseout', function(d,i){
    d3.select(this)
      .style("opacity", ".8")
   });
  b=1;
 }
//that's all for now!
})
})