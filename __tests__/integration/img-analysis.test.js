const {
    describe,
    test,
    expect
} = require('@jest/globals')
const requestMock = require('../mocks/request.json')

const aws = require('aws-sdk')
aws.config.update({
    region: 'us-east-1'
})

const {
    main
} = require('../../src')

describe('image-analyser test suit', () => {
    test('it should analyse successfully the image returns the results', async() => {
        const finalText = [
        "99.33% de ser do tipo Animal",
        "99.33% de ser do tipo canino",
        "99.33% de ser do tipo cão",
        "99.33% de ser do tipo mamífero",
        "99.33% de ser do tipo animal de estimação",
        "86.95% de ser do tipo cão",
        "84.30% de ser do tipo labrador retriever"
        ].join('\n')
        const expected = {
            statusCode: 200,
            body: `a imagem tem \n`.concat(finalText)
        }

        const result = await main(requestMock)
        expect(result).toStrictEqual(expected)
    })
    // test('given an empty queryString it should return status code 400', async() => {
    //     const expected = {
    //         statusCode: 400,
    //         body: 'an Image is required'
    //     }

    //     const result = await main({
    //         queryStringParameters: {}
    //     })

    //     expect(result).toStrictEqual(expected)
    // })
    test.todo('given an invalid queryString it should return status code 500')
})