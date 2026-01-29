export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Quote Management API",
    version: "1.0.0",
    description: "Kişisel Quote/Note yönetim sistemi için REST API",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://your-app.vercel.app",
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Quotes",
      description: "Quote/Note işlemleri",
    },
  ],
  paths: {
    "/api/quotes": {
      get: {
        tags: ["Quotes"],
        summary: "Tüm notları listele",
        description: "Arama, filtreleme ve sıralama ile notları getirir",
        parameters: [
          {
            name: "search",
            in: "query",
            description: "İçerik veya yazar araması",
            required: false,
            schema: {
              type: "string",
              example: "motivasyon",
            },
          },
          {
            name: "sort",
            in: "query",
            description: "Sıralama türü",
            required: false,
            schema: {
              type: "string",
              enum: ["newest", "oldest", "alphabetical"],
              default: "newest",
            },
          },
        ],
        responses: {
          200: {
            description: "Başarılı",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Quote",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Quotes"],
        summary: "Yeni not oluştur",
        description: "Yeni bir quote/note ekler",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: {
                  content: {
                    type: "string",
                    example: "Hayat güzeldir",
                  },
                  author: {
                    type: "string",
                    example: "Mevlana",
                  },
                  category: {
                    type: "string",
                    example: "Motivasyon",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Oluşturuldu",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Quote",
                },
              },
            },
          },
          400: {
            description: "Geçersiz veri",
          },
        },
      },
      delete: {
        tags: ["Quotes"],
        summary: "Toplu silme",
        description: "Birden fazla notu ID listesi ile siler",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ids"],
                properties: {
                  ids: {
                    type: "array",
                    items: {
                      type: "number",
                    },
                    example: [1, 2, 3],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Silindi",
          },
          400: {
            description: "Geçersiz ID listesi",
          },
        },
      },
    },
    "/api/quotes/{id}": {
      get: {
        tags: ["Quotes"],
        summary: "Tek bir notu getir",
        description: "ID ile belirli bir notu getirir",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Başarılı",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Quote",
                },
              },
            },
          },
          404: {
            description: "Not bulunamadı",
          },
        },
      },
      put: {
        tags: ["Quotes"],
        summary: "Notu güncelle",
        description: "Mevcut bir notu günceller",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                  },
                  author: {
                    type: "string",
                  },
                  category: {
                    type: "string",
                  },
                  isFavorite: {
                    type: "boolean",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Güncellendi",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Quote",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Quotes"],
        summary: "Notu sil",
        description: "Belirli bir notu siler",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Silindi",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Quote: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          content: {
            type: "string",
            example: "Hayat güzeldir",
          },
          author: {
            type: "string",
            nullable: true,
            example: "Mevlana",
          },
          category: {
            type: "string",
            nullable: true,
            example: "Motivasyon",
          },
          isFavorite: {
            type: "boolean",
            example: false,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
    },
  },
};
