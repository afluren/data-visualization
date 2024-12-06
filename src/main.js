import csv from './assets/keymaps.csv';
import text from './assets/keyList.txt';
import csv2 from './assets/zyc/stat_key.csv';

import draw_heatmap from './heatmap.js';

const CONFIG = {
    svg_width: 1000,
    svg_height: 500,
    svg_ID:'keyboard',
    num_x: 23,//横坐标的块数
    num_y: 7,//纵坐标的块数
    canvas_width: {//画布宽的起始位置
        start: 86,
        end: 914
    },
    canvas_height: {//画布高的起始位置
        start: 0,
        end: 378
    },
    text: text,//键位替换文本
    keymaps: csv,//键位信息
    users_keymaps: csv2,//用户键位信息
    key_opacity_box: [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 1],//键位透明度分布（和下面那个都和数据分布相关）
    key_colors: ["#F0E68C", "red"]//键位颜色分布
}
draw_heatmap(CONFIG);