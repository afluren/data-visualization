//注意：因为数据的特殊性，我只考虑了月日的变化，如果为了程序更加健全，也许后面会在考虑年的变化
//TODO: 由于具体的样式细节还不太确定，所以先只做一个大概的热力图
//目前可以做的：
//1、根据数量绘制热力图
//2、通过滑动条来控制数量的阈值
import * as d3 from 'd3';
import csv from './assets/zyc/statFreq_hours.csv';
import { initialize_SVG, getWeek } from './utils';

const CONFIG = {
    svg_width: 1000,
    svg_height: 500,
    canvas_width: {//画布宽的起始位置
        start: 86,
        end: 914
    },
    canvas_height: {//画布高的起始位置
        start: 68,
        end: 452
    },
    svg_ID: 'timetable',
    num_x: 7,
    num_y: 24,
    background_color: '#39C5BB',
    category: 'key'
};


function draw_Basic(CONFIG) {
    const svg = initialize_SVG(CONFIG.svg_width, CONFIG.svg_height, CONFIG.svg_ID);
    svg.attr("transform", "translate(150,100)");//TODO:这地方的数据记得之后加进CONFIG里面，不过准确的说应该要改initialize_SVG函数里面的参数
    const xScale = d3.scaleLinear().domain([0, CONFIG.num_x]).range([CONFIG.canvas_width.start, CONFIG.canvas_width.end]);
    const yScale = d3.scaleLinear().domain([0, CONFIG.num_y]).range([CONFIG.canvas_height.start, CONFIG.canvas_height.end]);
    for (var i = 0; i < CONFIG.num_x; i++) {
        for (var j = 0; j < CONFIG.num_y; j++) {
            svg.append('rect')
                .attr('x', xScale(i))
                .attr('y', yScale(j))
                .attr('width', xScale(1) - xScale(0))
                .attr('height', yScale(1) - yScale(0))
                .attr('fill', CONFIG.background_color)
                .attr('opacity', 0.6)
                .attr('stroke', 'white')
                .attr('stroke-width', 0.4);
        }
    }
    const xLabels = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
    svg.selectAll('.xLabel')
        .data(xLabels)
        .enter()
        .append('text')
        .text((d) => d)
        .attr('x', (d, i) => xScale(i) + (xScale(1) - xScale(0)) / 2)
        .attr('y', yScale(0) - 20)
        .attr('font-size', 14)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black');

    const yLabels = Array.from({ length: 24 }, (_, i) => {
        return i < 10 ? `0${i}:00` : `${i}:00`;
    });
    svg.selectAll('.yLabel')
        .data(yLabels)
        .enter()
        .append('text')
        .text((d) => d)
        .attr('x', xScale(0) - 20)
        .attr('y', (d, i) => yScale(i) + (yScale(1) - yScale(0)) / 2)
        .attr('font-size', 14)
        .attr('text-anchor', 'end')
        .attr('fill', 'black');
    return [svg, xScale, yScale];
}

function data_merged_by_hour(data) {
    let data_divided_by_week = [];
    for (let i = 0; i < 7; i++) {
        data_divided_by_week.push(data.filter((d) => getWeek(d[0].year + '-' + d[0].month + '-' + d[0].day) == i));
    }
    console.log(data_divided_by_week);
    let data_merged_by_hour = data_divided_by_week.map((d) => {
        let merged_sum = [];
        for (let i = 0; i < 24; i++) {
            const key_sum = d.reduce((acc, cur) => acc + Number(cur[i].keyCount) / d.length, 0);
            const mouse_sum = d.reduce((acc, cur) => acc + Number(cur[i].mouseCount) / d.length, 0);
            const distance_sum = d.reduce((acc, cur) => acc + Number(cur[i].distance) / d.length, 0);
            merged_sum.push({ keyCount: `${key_sum}`, mouseCount: `${mouse_sum}`, distance: `${distance_sum}`, hour: i < 10 ? `0${i}` : `${i}` });
        }
        return merged_sum;
    });
    console.log(data_merged_by_hour);
    return data_merged_by_hour;
}



function draw_data(data, svg = null, xScale = null, yScale = null) {

    let data_in_one_line_raw = [];
    for (let i = 0; i < data.length; i++) { 
        data_in_one_line_raw.push(...data[i]);
    }
    let data_in_one_line= data_in_one_line_raw.slice().sort((a, b) => a.keyCount - b.keyCount);
    console.log(data_in_one_line);
    svg.selectAll('.use-time')//TODO:这里的样式我完全没过脑子，实际上这里是要和滑动条配合的，会做的,
        .data(data_in_one_line_raw)
        .enter()
        .append('rect')
        .attr('x', (d, j) => xScale(j % 7))
        .attr('y', (d, j) => yScale(+d.hour))
        .attr('width', xScale(1) - xScale(0))
        .attr('height', yScale(1) - yScale(0))
        .attr('fill', (d) => {
            if (d.keyCount > 1000) {
                return 'red';
            } else if (d.keyCount > 500) {
                return 'orange';
            } else {
                return 'none';
            }
        })
        .attr('opacity', 0.8)
        .attr('stroke', 'none')
        .attr('class', 'use-time');

    svg.append('rect')
        .attr('class', 'slider-path')
        .attr('x', xScale(0))
        .attr('y', yScale(24))
        .attr('width', xScale(7) - xScale(0))
        .attr('height', svg.attr('height') - yScale(24))
        .attr('fill', 'gray')
        .attr('opacity', 0.2)
        .attr('stroke', 'none');

    let gragging = false;
    svg.append('rect')
        .attr('class', 'slider-rect')
        .attr('x', xScale(0))
        .attr('y', yScale(24))
        .attr('width', xScale(1) - xScale(0))
        .attr('height', svg.attr('height') - yScale(24))
        .attr('fill', 'green')
        .attr('opacity', 1)
        .attr('stroke', 'none')
        .attr('cursor', 'pointer')
        .on("mousedown", (event) => {
            console.log('down!');
            gragging = true;
            const x = d3.pointer(event)[0];
            let rect = d3.select(event.target);
            let diff = x - rect.attr("x");
            d3.select("body").on("mousemove", (ev) => {
                if (gragging) {
                    rect.attr('x', Math.max(xScale(0), Math.min(d3.pointer(ev)[0] - 150 - diff, xScale(7) - rect.attr("width"))));
                    let display_rate = +rect.attr('x')/(xScale(7) - xScale(0));
                    svg.selectAll('.use-time')
                        .attr('fill', (d) => {
                            if (+d.keyCount > +data_in_one_line[Math.round((1 + display_rate) / 2 * (data_in_one_line.length - 1))].keyCount) {
                                console.log(`red_line: ${data_in_one_line[Math.round((1 + display_rate) / 2 * (data_in_one_line.length - 1))].keyCount}`);
                                console.log(`current_value: ${d.keyCount}`);
                                return 'red';
                            } else if (+d.keyCount > +data_in_one_line[Math.round(display_rate * (data_in_one_line.length - 1))].keyCount) {
                                return 'orange';
                            } else {
                                return 'none';
                            }
                        });
                }
            });
        });
        
        d3.select("body").on("mouseup", () => {
            console.log('up!');
            gragging = false;
            if (d3.select("body").on("mousemove")) {
                d3.select("body").on("mousemove", null);
            }
        });
    
}
function draw_main(CONFIG) {
    const [svg, xScale, yScale] = draw_Basic(CONFIG);
    d3.csv(csv).then((data) => {
        console.log(data);
        let year = '2024';
        let month = '01';
        let day = '01';
        let count = 0;
        let result = [];
        data.forEach((d) => {
            let update = false;
            if (d.month != month || d.day != day) {
                update = true;
            }
            if (update) {
                while (count % 24 != 0) {
                    result[result.length - 1].push({ keyCount: '0', mouseCount: '0', distance: '0', year: year, month: month, day: day, hour: count % 24 < 10 ? `0${count % 24}` : `${count % 24}` });
                    count = count + 1;
                }
                month = d.month;
                day = d.day;
                result.push([]);
            }
            while (count % 24 != (+d.hour)) {
                result[result.length - 1].push({ keyCount: '0', mouseCount: '0', distance: '0', year: year, month: month, day: day, hour: count % 24 < 10 ? `0${count % 24}` : `${count % 24}` });
                count = count + 1;
            }
            result[result.length - 1].push(d);
            count = count + 1;
        });
        console.log(result);
        result = data_merged_by_hour(result);
        draw_data(result, svg, xScale, yScale);
    });

}


//这里是测试是否可以直接保存函数变量的代码，结果是可以
const test = {
    func1: draw_Basic,
    func2: draw_data,
    func3: draw_main
}



test['func3'](CONFIG);