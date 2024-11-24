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
    text: text,
    keymaps: csv,
    users_keymaps: csv2
}
draw_heatmap(CONFIG);