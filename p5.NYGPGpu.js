
function pack3(value) {
    let z = int(value / 65536);
    let y = int((value - z * 65536) / 256);
    let x = int(value) % 256;
    return [x, y, z]
}

// assume values range is 0-255
function unpack3(values) {
    return values[0] + values[1] * 256 + values[2] * 65536;
}

// data range between -4096 ~ 4096 float
function realToRaw(realValue) {
    return (realValue + 8192.0) * 1024.0;
}

function rawToReal(rawValue) {
    return rawValue / 1024.0 - 8192.0;
}

class NYGPGpu {
    constructor(options = {}) {
        this._name = `NYGPGPU-${int(random(1, 65535))}`;
        this._size = 512; // init a 2x2 data array, each 65535 values

        this._dataSets = 4;
        this._dataSize = this._size / 2;

        this._dataImgA = createGraphics(this._size, this._size, WEBGL);
        this._dataImgA.pixelDensity(1);
        this._dataImgA.background(0);

        this._dataImgB = createGraphics(this._size, this._size, WEBGL);
        this._dataImgB.pixelDensity(1);
        this._dataImgB.background(0);

        this._lastProcessedTexture = this._dataImgA;
        this._extraData = [];
        this._isA = false;

        this._initTextures();
    }

    _initTextures() {
        // dataA to dataB
        {
            let gl = this._dataImgA._renderer.GL;
            let texDataB = new p5.Texture(this._dataImgA._renderer, this._dataImgB, {
                'minFilter': gl.NEAREST,
                'magFilter': gl.NEAREST
            });
            this._dataImgA._renderer.textures.push(texDataB);
        }

        // dataB to dataA
        {
            let gl = this._dataImgB._renderer.GL;
            let texDataB = new p5.Texture(this._dataImgB._renderer, this._dataImgA, {
                'minFilter': gl.NEAREST,
                'magFilter': gl.NEAREST
            });
            this._dataImgB._renderer.textures.push(texDataB);
        }
    }

    setDataValueXYZ(index, values, dataSet = 0)
    {
        let x = index % this._dataSize;
        let y = int(index / this._dataSize);

        let drawOffsetX = this._dataSize * (-1 + dataSet % 2);
        let drawOffsetY = this._dataSize * (-1 + int(dataSet / 2));

        this._dataImgA.noStroke();
        this._dataImgA.fill(values[0], values[1], values[2], 255);
        this._dataImgA.rect(x + drawOffsetX, y + drawOffsetY, 1, 1);

        this._dataImgB.noStroke();
        this._dataImgB.fill(values[0], values[1], values[2], 255);
        this._dataImgB.rect(x + drawOffsetX, y + drawOffsetY, 1, 1);
    }

    setDataValue(index, value, dataSet = 0) {
        let packedValues = pack3(realToRaw(value));

        this.setDataValueXYZ(index, packedValues, dataSet);
    }

    createShader(vertData, fragData) {
        this._shaderA = this._dataImgA.createShader(vertData, fragData);
        this._shaderB = this._dataImgB.createShader(vertData, fragData);
    }

    loadShader(shaderVert, shaderFrag) {
        this._shaderA = loadShader(shaderVert, shaderFrag);
        this._shaderB = loadShader(shaderVert, shaderFrag);
    }

    setShader(shaderDataA, shaderDataB) {
        this._shaderA = shaderDataA;
        this._shaderB = shaderDataB;
    }

    setUniform(dataName, dataContent) {
        this._extraData[dataName] = dataContent;
    }

    process() {

        if (this._isA) {
            // setup custom texture input
            this._dataImgA.noStroke();
            this._dataImgA.shader(this._shaderA);
            this._shaderA.setUniform('uDataTexture', this._dataImgB);

            // setup extra data
            let dataNames = Object.keys(this._extraData);
            
            for (let i = 0; i < dataNames.length; i++)
                this._shaderA.setUniform(dataNames[i], this._extraData[dataNames[i]]);

            this._dataImgA.plane(this._size, this._size);

            this._dataImgA.resetShader();
            this._lastProcessedTexture = this._dataImgA;
        }
        else {
            this._dataImgB.noStroke();
            this._dataImgB.shader(this._shaderB);
            this._shaderB.setUniform('uDataTexture', this._dataImgA);

            // setup extra data
            let dataNames = Object.keys(this._extraData);
            for (let i = 0; i < dataNames.length; i++)
                this._shaderB.setUniform(dataNames[i], this._extraData[dataNames[i]]);

            this._dataImgB.plane(this._size, this._size);

            this._dataImgB.resetShader();
            this._lastProcessedTexture = this._dataImgB;
        }

        // switch read write
        this._isA = !this._isA;
    }

    getTexture() {
        return this._lastProcessedTexture;
    }
}
