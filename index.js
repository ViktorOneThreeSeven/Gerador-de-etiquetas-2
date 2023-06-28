var download_buttons = []
let image = new Image()
var loc_x = 30,loc_y = 50

function upload() {
    var files = document.getElementById('file_upload').files;
    if (files.length == 0) {
        alert("Selecione um arquivo")
        return;
    }
    var filename = files[0].name;
    var extension = filename.substring(filename.lastIndexOf(".")).toUpperCase()
    if (extension == '.XLS' || extension == '.XLSX') {
        excelFileToJSON(files[0])
    } else {
        alert("Este arquivo não é XLS ou XLSX");
    }
}

function excelFileToJSON(file) {
    try {
        var reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = function (e) {

            var data = e.target.result
            var workbook = XLSX.read(data, {
                type: 'binary'
            });
            result = {};
            workbook.SheetNames.forEach(function (sheetName) {
                var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName])
                if (roa.length > 0) {
                    result[sheetName] = roa;
                }
            });
            criar_canvas(result)

        }
    } catch (e) {
        console.error(e);
    }
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' '
        var metrics = context.measureText(testLine)
        var testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y)
            line = words[n] + ' '
            y += lineHeight
            loc_y += lineHeight;
        }
        else {
            line = testLine
        }
    }
    context.fillText(line, x, y)
}

function criar_canvas(data) {

    data = JSON.parse(
        JSON.stringify(data)
        .replace(/\"CODIGO DE BARRAS\":/g, "\"codigo_barras\":")
        .replace(/\"REFERÊNCIA\":/g, "\"ref\":")
        .replace(/\"NOME COMERCIAL\":/g, "\"nome_comercial\":")
        .replace(/\"INDICAÇÃO DE FAIXA ETÁRIA\":/g, "\"indic_etaria\":")
        .replace(/\"RESTRIÇÃO DE FAIXA ETÁRIA\":/g, "\"restric_etaria\":")
        .replace(/\"COMPOSIÇÃO\":/g, "\"composicao\":")
        .replace(/\"QUANTIDADE\":/g, "\"qtd\":")
        .replace(/\"DATA DE FABRICAÇÃO\":/g, "\"data_fabricado\":")
        .replace(/\"DATA DE VALIDADE\":/g, "\"data_validade\":")
    )

    for (let i = 0; i < data['Plan1'].length; i++) {

        //CRIANDO CANVAS E SEU CONTEXTO
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')

        //DEFININDO ESTILO AO CANVAS
        canvas.style = 'position: relative; left:50%; transform: translateX(-50%);'
        canvas.width = 396*2
        canvas.height = 280*2
        canvas.id = `etiqueta_canva_${i}`
        var maxWidth = canvas.width / 2 / 1.2
        canvas.style.border = '1px solid black'
        canvas.style.margin = '10px'

        //CONFIGURANDO O CONTEXTO
        ctx.clearRect(0, 0, 0, 0)
        document.getElementById('box_canvas').appendChild(canvas)
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "black";
        
        //GERANDO REFERENCIA
        ctx.font = "25px Arial"
        loc_x = 40
        loc_y = 60
        var lineHeight = 25
        var text = data['Plan1'][i]['ref']
        wrapText(ctx, text, loc_x, loc_y, maxWidth, lineHeight)

        //GERANDO nome comercial
        ctx.font = "25px Arial"
        text = data['Plan1'][i]['nome_comercial']
        loc_y += lineHeight * 2;
        wrapText(ctx, text, loc_x, loc_y, maxWidth, lineHeight)

        //GERANDO CODIGO DE BARRAS
        ctx.font = "20px Arial"
        text = `UPC: ${data['Plan1'][i]['codigo_barras'].toString()}`
        loc_y += lineHeight * 2;
        wrapText(ctx, text, loc_x, loc_y, maxWidth, lineHeight)

        ctx.font = "25px Arial Black"
        text = `${data['Plan1'][i]['indic_etaria'].toString()}`
        loc_y = 60
        var metrics = ctx.measureText(text);
        loc_x = (canvas.width - metrics.width) / 2;
        wrapText(ctx, text, loc_x, loc_y, maxWidth, lineHeight)

        if(data['Plan1'][i]['restric_etaria'].toString().includes('3')){
            var image = new Image();
            image.src = './img/restricao_3_anos.png';
            image.onload = function() {
                ctx.drawImage(image, (canvas.width - 120) / 2, 130, 120, 120);
            };
        }

        download_buttons[i] = canvas;

    }
    const button = document.getElementById('download_etiquetas')
    button.style.display = 'flex'
}

function download(){
    for (let i = 0; i < download_buttons.length; i++) download_buttons[i].click() //Dowload
}

function convertToPDF(){
    for (let i = 0; i < download_buttons.length; i++) {
        var canvas = download_buttons[i]
        var width = canvas.width
        var height = canvas.height
        var widthInPoints = width * 72 / 96
        var heightInPoints = height * 72 / 96

        var imgData = canvas.toDataURL('image/jpeg', 1.0)
    
        var pdfdoc = new jsPDF('l', 'pt', [heightInPoints, widthInPoints])
    
        pdfdoc.addImage(imgData, 'JPEG', 0, 0, widthInPoints, heightInPoints)
        pdfdoc.save('download.pdf')
    }

}