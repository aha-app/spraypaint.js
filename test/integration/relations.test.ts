import { expect, fetchMock } from "../test-helper"
import { Author, NonFictionAuthor } from "../fixtures"
import { IResultProxy } from "../../src/proxies/index"

const generateMockResponse = (type: string) => {
  return {
    data: {
      id: "1",
      type,
      attributes: {
        firstName: "John"
      },
      relationships: {
        books: {
          data: [
            {
              id: "book1",
              type: "books"
            }
          ]
        },
        multi_words: {
          data: [
            {
              id: "multi_word1",
              type: "multi_words"
            }
          ]
        }
      }
    },
    included: [
      {
        id: "book1",
        type: "books",
        attributes: {
          title: "The Shining"
        }
      },
      {
        id: "multi_word1",
        type: "multi_words",
        attributes: {}
      }
    ]
  } as any
}

describe("Relations", () => {
  describe("#find()", () => {
    beforeEach(() => {
      fetchMock.get(
        "http://example.com/api/v1/authors/1?include=books,multi_words",
        generateMockResponse("authors")
      )
    })

    afterEach(fetchMock.restore)

    it("correctly includes relationships", async () => {
      const data = await Author.includes(["books", "multi_words"]).find(1)

      expect(data.multiWords).to.be.an("array")
      expect(data.books).to.be.an("array")
    })

    it("contains the right records for each relationship", async () => {
      const author = await Author.includes(["books", "multi_words"]).find(1)
      expect(author.books[0].title).to.eql("The Shining")
      expect(author.multiWords[0].id).to.eql("multi_word1")
    })

    describe("when a belongsTo relationship has null data", () => {
      beforeEach(() => {
        const response = generateMockResponse("authors")
        response.data.relationships = { genre: { data: null } }
        delete response.data.included
        fetchMock.get(
          "http://example.com/api/v1/authors/1?include=genre",
          response
        )
      })

      it("does not blow up", async () => {
        const author = await Author.includes(["genre"]).find(1)
        expect(author.klass).to.eq(Author)
        expect(author.genre).to.eq(undefined)
      })
    })
  })

  describe("when keyCase is snake_case", () => {
    beforeEach(() => {
      fetchMock.get(
        "http://example.com/api/v1/non_fiction_authors/1?include=books,multi_words",
        generateMockResponse("non_fiction_authors")
      )
    })

    afterEach(fetchMock.restore)

    it("Doesn't convert relationships to snake_case if keyCase.to is snake is off", async () => {
      const data = await NonFictionAuthor.includes([
        "books",
        "multi_words"
      ]).find(1)
      expect(data.multi_words[0].id).to.eql("multi_word1")
    })
  })
})
