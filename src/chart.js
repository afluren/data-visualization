// TODO: 完成以下任务：
//1、正确显示有效键位和无效键位(f)
//2、正确在有效键位上显示键位编号(f)
//3、正确显示键位的背景色和透明度(f)
//4、模块化整理代码，提高可读性和后续的使用(f)
//5、交互设计，先做鼠标点击切换数据日期的功能
//  + 鼠标点击切换日期，目前使用表单来处理这个。要做的是，点击相应的日期就显示当天的键位热力图。(f)
//  + 至于图表切换部分我的想法也是，只修改vaild-key的绘制即可，然后效果就自己实现了。(f)

//FIXME: 目前已知bug：
//1、键盘上属性相同的键没有做区分（实际上有第二个键做区分，但是有点复杂其实）
import * as d3 from 'd3';
import csv from './assets/keymaps.csv'
import text from './assets/keyList.txt'
import csv2 from './assets/zyc/stat_key.csv'

const CONFIG = {
  svg_width: 1000,
  svg_height: 500,
  num_x: 23,//横坐标的块数
  num_y: 7,//纵坐标的块数
  canvas_width: {//画布宽的起始位置
    start: 86,
    end: 914
  },
  canvas_height: {//画布高的起始位置
    start: 0,
    end:378
  },
  text: text,
  keymaps: csv,
  users_keymaps: csv2
}
//输出等差数列
function range(start, stop, step) {
  return Array.from({ length: Math.floor((stop - start) / step + 1 )}, (_, i) => start + (i * step));
}
//数组内部元素合并
//TODO：这里需要实现一个数组内部元素合并的功能
function merge_array(arr, indexS, indexE) {
  let result = [];
  for (let i = indexS; i <= indexE; i++){
    arr[i].forEach(d => {
      let item = result.find(item => item.keyname == d.keyname);
      if (item == undefined) {
        result.push(d);
      }
      else {
        item.keycount = `${+d.keycount+(+item.keycount)}`;
      }
    });
  }
  console.log(result);
  return result;
}
//创建SVG画布
function initialize_SVG(width, height) {
  return d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "keyborad")
    .attr("transform", "translate(100, 100)")
    .style("background-color", "white");
}
//创建坐标轴
function draw_Axis(svg, xScale, yScale,xTicks,yTicks) {
  var xAxis = d3.axisBottom(xScale)
  .tickFormat("")
  .ticks(xTicks);

  var yAxis = d3.axisLeft(yScale)
    .tickFormat("")
    .ticks(yTicks);

  svg.append("g")
    .attr("transform", "translate(0, 378)")
    .call(xAxis);

  svg.append("g")
    .attr("transform", "translate(86, 0)")
    .call(yAxis);
  
}
//创建坐标刻度
function draw_Labels(svg, xLabels, yLabels, xScale, yScale) {
  svg.selectAll(".xLabel")
    .data(xLabels)
    .enter()
    .append("text")
    .attr("class", "xLabel")
    .attr("x", (d) => xScale(d) + 18)
    .attr("y", 390)
    .text((d) => d)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "black");

  svg.selectAll(".yLabel")
    .data(yLabels)
    .enter()
    .append("text")
    .attr("class", "yLabel")
    .attr("x", 80)
    .attr("y", (d) => yScale(d) - 20)
    .text((d) => d)
    .style("text-anchor", "end")
    .style("font-size", "12px")
    .style("fill", "black");
}
//创建键位背景
function draw_key_background(svg, rect_width, rect_height,num_x,num_y,xScale, yScale) {
  let opacity_box = [0.1, 0.05, 0];

  for (let i = 0; i < num_x; i++) {
    for (let j = 1; j < num_y+1; j++) {
      svg.append("rect")
        .attr("x", xScale(i))
        .attr("y", yScale(j))
        .attr("width", rect_width)
        .attr("height", rect_height)
        .style("fill", "grey")
        .style("opacity", opacity_box[(i + j) % 3])
        .attr("class", "background-key");
    }
  }
}
//获取键位文本
function getkeytext(text) {
  let keytext_replaced = [];
  let keytext_replaced_temp = [];//keytext_replaced的副本，原因是JavaScript不自带深拷贝，或者说对多层数组不自带深拷贝
  //这里是为了把所有的文本替换成小图片的测试代码,测试相当成功
  d3.text(text).then(text => { 
    const lines = text.split("\n");
    lines.forEach((d) => {
      d = d.replace(/ /g, "");
      keytext_replaced.push(d.split(":"));
      keytext_replaced_temp.push(d.split(":"));
    });
  });
  return [keytext_replaced, keytext_replaced_temp];
}
//原始数据转成键位信息
function str_to_key_list(Loc,key_list,keytext_replaced) {
  let result = Loc.replace(/\]/g, "").split("[");
  result.forEach((d, index, arr) => {
    if (d.endsWith(",")) {
      arr[index] = d.slice(0, -1);
    }
    arr[index] = arr[index].split(",");
  });
  let final = result.filter(d => d.length > 2);
  final.forEach((d, index, arr) => {
    for (let i = 2; i < d.length; i++) {
      arr[index][i] = arr[index][i].replace(/"/g, "");
      arr[index][i] = arr[index][i].split("\\n");
      for (let j = 0; j < keytext_replaced.length; j++) {
        if (arr[index][i][0] == keytext_replaced[j][0]) {
          arr[index][i][0] = keytext_replaced[j][1];
        }
      }
    }
  });
  //对文本的特殊修改
  final[69][2][1] = '[';
  final[70][2][1] = ']';
  final[70][3][0] = ']';
  final[71][2][1] = '\\';
  final[71][3][0] = '\\';
  final[52][2][0] = '\"';
  final[30] = ['9', '1', ['<', ','], [',']];
  //TODO：用find处理数据，将每一个final后面加上对应的次数，然后再做一个颜色渐变的效果数组，实现热力图
  final.forEach((d, index, arr) => {
    let temp;
    if (d.length > 3) {
      temp = d[2].length > 1 ? key_list.find(key => (key.keyname == d[2][0] || key.keyname == d[2][1] || key.keyname == d[3][0])) : key_list.find(key => (key.keyname == d[2][0] || key.keyname == d[3][0]));
    }
    else {
      temp = d[2].length > 1 ? key_list.find(key => (key.keyname == d[2][0] || key.keyname == d[2][1])) : key_list.find(key => key.keyname == d[2][0]);
    }
    if (temp!= undefined) {
      arr[index].push(temp.keycount);
    }
    else {
      arr[index].push('0');
    }
  });
  return final;
}
//绘制键位
function draw_key(csv,key_list,keytext_replaced,svg, xScale, yScale, rect_width, rect_height) {
  //透明度以0.5为界，然后背景就用我这里显示的透明度数组来体现即可，

  d3.csv(csv).then(data => {
    const Location = data[2].mapDetail;
    let final = str_to_key_list(Location, key_list, keytext_replaced);
    let num_list = key_list.map(d => d.keycount).sort((a, b) => (+a) - (+b));
    const getID = (num) => {
      let id = 0;
      while (id!= num_list.length&&num_list[id] <= num) {
        id++;
      }
      return id/num_list.length;
    };

    svg.append("defs")
      .append("filter")
      .attr("id", "blur-filter")
      .append("feGaussianBlur")
      .attr("in", "SourceGraphic") // 目标为矩形的Alpha通道
      .attr("stdDeviation", 2);

    let colors = ["#F0E68C", "red"];
    let opacity_box = [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 1];
    

    svg.append("rect")
      .attr("class", "temp-text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 40)
      .attr("height", 20)
      .style("fill", "white")
      .style("stroke", "none")
      .style("opacity", 1)
      .attr("visiability", "hidden");


    svg.selectAll(".valid-key")
      .data(final)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(+d[0]))
      .attr("y", (d) => yScale(+d[1] + 1))
      .attr("width", rect_width)
      .attr("height", rect_height)
      .style("fill", (d) => {
        let temp = Math.round(getID(+d[d.length - 1]) * (colors.length - 1));
        return temp >= 0 ? colors[temp] : colors[0];
      })
      .style("opacity", 0)
      .style("stroke", "none")
      .attr("class", "valid-key")
      .attr("pointer-events", "all")
      .on("mouseover", (event, d) => {
        svg.append("rect")
          .attr("class", "temp-stroke")
          .attr("x", xScale(+d[0]))
          .attr("y", yScale(+d[1] + 1))
          .attr("width", rect_width)
          .attr("height", rect_height)
          .style("fill", "none")
          .style("stroke", "black")
          .style("stroke-width", "0px")
          .style("opacity", 0.5)
          .style("filter", "url(#blur-filter)")
          .transition().duration(300)
          .style("stroke-width", "2px");
        svg.select(".temp-stroke").lower();

        svg.append("rect")
          .attr("class", "temp-text")
          .attr("x", +d3.select(event.target).attr("x") + rect_width)
          .attr("y", +d3.select(event.target).attr("y") + rect_height / 3)
          .attr("width", 40)
          .attr("height", 20)
          .style("fill", "white")
          .style("stroke", "none")
          .style("opacity", 0.8);
        
        d3.select(event.target)
          .style("opacity", (d) => {
            let temp = Math.round(getID(+d[d.length - 1]) * (opacity_box.length - 1));
            return temp >= 0 ? opacity_box[temp] - 0.2 : opacity_box[0] - 0.2;
          });
        
        svg.attr("cursor", "pointer");
      })
      .on("mousemove", (event, d) => {
        svg.select(".temp-text")
          .style("x", +d3.select(event.target).attr("x") + rect_width)
          .style("y", +d3.select(event.target).attr("y") + rect_height / 3);
        svg.attr("cursor", "pointer");
      })
      .on("mouseout", (event, d) => {
        svg.selectAll(".temp-stroke").remove();
        svg.selectAll(".temp-text").remove();
        d3.select(event.target).style("opacity", (d) => {
          let temp = Math.round(getID(+d[d.length - 1]) * (opacity_box.length - 1));
          return temp >= 0 ? opacity_box[temp] : opacity_box[0];
        });
        svg.attr("cursor", "default");
      });
    
    svg.selectAll(".valid-key")
      .transition().duration(300)
      .style("opacity", (d) => {
        let temp = Math.round(getID(+d[d.length - 1]) * (opacity_box.length - 1));
        return temp >= 0 ? opacity_box[temp] : opacity_box[0];
      })
  
    svg.selectAll(".vaild-key-text")
      .data(final)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(+d[0]) + rect_width / 2)
      .attr("y", (d) => yScale(+d[1] + 1) + rect_height / 2)
      .text((d) => d[2][0])
      .style("font-size", "12px")
      .style("fill", "black")
      .style("text-anchor", "middle")
      .attr("class", "vaild-key-text")
      .attr("pointer-events", "none")
      .append("tspan")
      .attr("x", (d) => xScale(+d[0]) + rect_width / 2)
      .attr("y", (d) => yScale(+d[1] + 1) + rect_height / 2 + 15)
      .text((d) => d[2][1])
      .style("font-size", "12px")
      .style("fill", "black")
      .style("text-anchor", "middle")
      .attr("pointer-events", "none");
  });

}
//基本套件绘制
function draw_Basic(CONFIG) {
  const xScale = d3.scaleLinear()
  .domain([0, CONFIG.num_x])
  .range([CONFIG.canvas_width.start, CONFIG.canvas_width.end]);
  const yScale = d3.scaleLinear()
  .domain([0,CONFIG.num_y])
  .range([CONFIG.canvas_height.end, CONFIG.canvas_height.start]);
  const xLabels = range(0, CONFIG.num_x-1, 1);
  const yLabels = range(0, CONFIG.num_y - 1, 1);
  
  const svg = initialize_SVG(CONFIG.svg_width, CONFIG.svg_height);
  draw_Axis(svg, xScale, yScale,CONFIG.num_x+1,CONFIG.num_y+1);
  draw_Labels(svg, xLabels, yLabels, xScale, yScale);

  const rect_width = (CONFIG.canvas_width.end - CONFIG.canvas_width.start) / CONFIG.num_x;
  const rect_height = (CONFIG.canvas_height.end - CONFIG.canvas_height.start) / CONFIG.num_y;

  draw_key_background(svg, rect_width, rect_height, CONFIG.num_x, CONFIG.num_y, xScale, yScale);
  return [svg, xScale, yScale, rect_width, rect_height];
}


//绘制主函数
function draw_main(CONFIG) {
  
  let [svg, xScale, yScale, rect_width, rect_height] = draw_Basic(CONFIG);
  let [keytext_replaced, keytext_replaced_temp]=getkeytext(CONFIG.text);
  let key_list_bytime = [];

  d3.csv(CONFIG.users_keymaps).then(data => {
    let year = "2024";
    let month = "1";
    let day = "1";
    data.forEach((d, index, arr) => {
      for (let j = 0; j < keytext_replaced_temp.length; j++) {
        if (d['keyname'] == keytext_replaced_temp[j][0]) {
          arr[index]['keyname'] = keytext_replaced_temp[j][1];
        }
      }
      if (d['day'] != day || d['month'] != month || d['year'] != year) {
        key_list_bytime.push([]);
        year = d['year'];
        month = d['month'];
        day = d['day'];
      }
      key_list_bytime[key_list_bytime.length - 1].push(d);
    });

    console.log(key_list_bytime);

    const dates = key_list_bytime.map(d => d[0]['year'] + "-" + d[0]['month'] + "-" + d[0]['day']);
    let [yearS, monthS, dayS] = dates[0].split("-");
    let [yearE, monthE, dayE] = dates[0].split("-");
    d3.select("body")
    .append("select")
    .attr("id", "select-date-start")
    .style("position", "absolute")
    .style("top", "10px")
    .style("left", "10px")
    .on("change", function () {
      yearS = d3.select(this).property("value").split("-")[0];
      monthS = d3.select(this).property("value").split("-")[1];
      dayS = d3.select(this).property("value").split("-")[2];
      if (monthS > monthE || (monthS == monthE && dayS > dayE)) {
        monthS=monthE;
        dayS = dayE;
        d3.select(this).property("value", yearS + "-" + monthS + "-" + dayS);
      }
      let indexE = dates.indexOf(yearE + "-" + monthE + "-" + dayE);
      let indexS = dates.indexOf(yearS + "-" + monthS + "-" + dayS);
      let key_list = merge_array(key_list_bytime, indexS, indexE);
      draw_key(CONFIG.keymaps, key_list, keytext_replaced, svg, xScale, yScale, rect_width, rect_height);
    });
      
    d3.select("body")
    .append("select")
    .attr("id", "select-date-end")
    .style("position", "absolute")
    .style("top", "10px")
    .style("left", "200px")
    .on("change", function () {
      yearE = d3.select(this).property("value").split("-")[0];
      monthE = d3.select(this).property("value").split("-")[1];
      dayE = d3.select(this).property("value").split("-")[2];
      let index = dates.indexOf(yearE + "-" + monthE + "-" + dayE);
      if (monthS > monthE || (monthS == monthE && dayS > dayE)) {
        monthE=monthS;
        dayE = dayS;
        d3.select(this).property("value", yearE + "-" + monthE + "-" + dayE);
      }
      let indexE = dates.indexOf(yearE + "-" + monthE + "-" + dayE);
      let indexS = dates.indexOf(yearS + "-" + monthS + "-" + dayS);
      let key_list = merge_array(key_list_bytime, indexS, indexE);
      draw_key(CONFIG.keymaps, key_list, keytext_replaced, svg, xScale, yScale, rect_width, rect_height);
    });

    d3.select("#select-date-start")
    .selectAll("option")
    .data(dates)  
    .enter()
    .append("option")  
    .attr("value", d => d)  
    .text(d => d); 
    
    d3.select("#select-date-end")
    .selectAll("option")
    .data(dates)  
    .enter()
    .append("option")  
    .attr("value", d => d)  
    .text(d => d); 
    
    draw_key(CONFIG.keymaps, key_list_bytime[0], keytext_replaced, svg, xScale, yScale, rect_width, rect_height);
  });
}
draw_main(CONFIG);