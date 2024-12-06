import * as d3 from 'd3';

//输出等差数列
export function range(start, stop, step) {
    return Array.from({ length: Math.floor((stop - start) / step + 1) }, (_, i) => start + (i * step));
}
//数组内部元素合并，专门合并键位数值的
//TODO：这里需要实现一个数组内部元素合并的功能(f)
export function merge_array(arr, indexS, indexE) {
    let result = [];
    for (let i = indexS; i <= indexE; i++) {
        arr[i].forEach(d => {
            let item = result.find(item => item.keyname == d.keyname);
            if (item == undefined) {
                result.push(d);
            }
            else {
                item.keycount = `${+d.keycount + (+item.keycount)}`;
            }
        });
    }
    console.log(result);
    return result;
}
//获取键位文本
export function getkeytext(text) {
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
export function str_to_key_list(Loc, key_list, keytext_replaced) {
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
    //TODO：用find处理数据，将每一个final后面加上对应的次数，然后再做一个颜色渐变的效果数组，实现热力图(f)
    final.forEach((d, index, arr) => {
        let temp;
        if (d.length > 3) {
            temp = d[2].length > 1 ? key_list.find(key => (key.keyname == d[2][0] || key.keyname == d[2][1] || key.keyname == d[3][0])) : key_list.find(key => (key.keyname == d[2][0] || key.keyname == d[3][0]));
        }
        else {
            temp = d[2].length > 1 ? key_list.find(key => (key.keyname == d[2][0] || key.keyname == d[2][1])) : key_list.find(key => key.keyname == d[2][0]);
        }
        if (temp != undefined) {
            arr[index].push(temp.keycount);
        }
        else {
            arr[index].push('0');
        }
    });
    console.log(final);//测试用
    return final;
}
//创建SVG画布
export function initialize_SVG(width, height, ID) {
    return d3.select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", ID)
      .attr("transform", "translate(100, 100)")
      .style("background-color", "white");
}
//获取星期，传入字符串：yyyy-mm-dd
//0代表周一，1代表周二，以此类推
export function getWeek(date) {
    //以老婆的生日为基准，从今年开始计算
    let birthday = new Date("2024-07-25");//周四
    let today = new Date(date);
    return ((today.getTime() - birthday.getTime()) / (24 * 3600 * 1000) + 3) % 7;
}
//arr是数组，element是值，永远是int，property是对象属性，用于对如果数组元素是对象的情况
export function getRateinArray(arr, element, property = null) {
    if (property == null) {
        return arr.silce().sort((a, b) => a - b).findIndex(num => num > element);
    } else {
        return arr.silce().sort((a, b) => a.property - b.property).findIndex(num => num.property > element);
    }
}