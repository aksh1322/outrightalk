const fs = require("fs");
const path = require("path");
var CleanCSS = require('clean-css');

var files = [
    {
        input: 'style.css',
        output: 'style.min.css'
    }, {
        input: 'custom.css',
        output: 'custom.min.css'
    }
]

const async = require("async");

async.eachOfSeries(files, (item, key, callback) => {
    new CleanCSS({sourceMap: true}).minify([
      `.${path.sep}public/styles/${item.input}`,
    ], (err, op) => {
        if (err) {
            return callback(err);
        }
        if (op && op.styles) {
            fs.writeFileSync(`.${path.sep}public/styles/${item.output}`, op.styles)
            console.log(item.input, ' minified!');
        }
        return callback(null);
    });
}, (err) => {
    if (err) {
        console.log('Error while minifying css', err);
    } else {
        console.log('Minification Done');
    }
})