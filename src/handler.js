const { get } = require('axios')
module.exports = class Handler {
    constructor({
        rekoSvc,
        translatorSvc
    }) {
        this.rekoSvc = rekoSvc
        this.translatorSvc = translatorSvc
    }

    async getImageBuffer(imageUrl) {
        // Fazer download da imagem e pegar o buffer
        const response = await get(imageUrl, {
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(response.data, 'base64');
        return buffer
    }

    async detectImageLabels(buffer) {
        const result = await this.rekoSvc.detectLabels({
            Image: {
                Bytes: buffer
            }
        }).promise();

        const workingItems = result.Labels.filter(({Confidence}) => Confidence > 80)
        
        const names = workingItems.map(({Name}) => Name).join(' and ');
        
        return {
            names, workingItems
        }
    }

    async translatingText(names) {
        const params = {
            SourceLanguageCode: 'en',
            TargetLanguageCode: 'pt',
            Text: names
        };

        const { TranslatedText } = await this.translatorSvc.translateText(params).promise();
        console.log({TranslatedText})

        return TranslatedText.split(' e ')
    }

    formatTextResults(texts, workingItems) {
        const finalText = []

        for(const indexText in texts) {
            const namePortuguese = texts[indexText]
            const confidence = workingItems[indexText].Confidence

            finalText.push(`${confidence.toFixed(2)}% de ser do tipo ${namePortuguese}`)
        }

        return finalText.join(' \n');
    }

    async main(event) {
        console.log(event)

        try {
            const {
                imageUrl
            } = event.queryStringParameters;
    
            if(!imageUrl) {
                return {
                    statusCode: 400,
                    body: 'an Image is required'
                }
            }

            console.log('downloading image ...')

            const buffer = await this.getImageBuffer(imageUrl)

            console.log('detecting labels... ')

            const { names, workingItems } = await this.detectImageLabels(buffer)

            console.log('translating Text ...')

            const texts = await this.translatingText(names)
            const finalText = this.formatTextResults(texts, workingItems)

            console.log('finishing ...')
    
            return {
                statusCode: 200,
                body: `a imagem tem \n`.concat(finalText)
            }
        } catch (error) {
            console.error('Deu Ruim', error.stack)
            return {
                statusCode: 500,
                body: 'Internal Server Error'
            }
        }
        
    }
}