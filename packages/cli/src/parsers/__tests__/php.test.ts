import { describe, expect, test } from "bun:test";
import { PhpParser } from "../formats/php.js";

describe("PHPParser", () => {
  const parser = new PhpParser({ type: "php" });

  test("parses simple key-value pairs", async () => {
    const input = `<?php

declare(strict_types=1);

return [
    'hello' => 'world',
    'test' => 'value',
];`;
    const result = await parser.parse(input);
    expect(result).toEqual({
      hello: "world",
      test: "value",
    });
  });

  test("parses nested arrays", async () => {
    const input = `<?php

declare(strict_types=1);

return [
  'nested' => [
      'key' => 'value',
      'another' => [
          'deep' => 'test',
      ],
  ],
];`;
    const result = await parser.parse(input);
    expect(result).toEqual({
      "nested.key": "value",
      "nested.another.deep": "test",
    });
  });

  test("parses Laravel-style language files", async () => {
    const input = `<?php

declare(strict_types=1);

return [
  'image_and_text_section' => [
      'title' => 'Start mastering your finances!',
      'steps' => [
          '1' => [
              'title' => 'Connect your accounts',
              'description' => 'Everything starts here.',
          ],
          '2' => [
              'title' => 'Organize and categorize',
              'description' => 'Put order in your money.',
          ],
      ],
  ],
];`;
    const result = await parser.parse(input);
    expect(result).toEqual({
      "image_and_text_section.title": "Start mastering your finances!",
      "image_and_text_section.steps.1.title": "Connect your accounts",
      "image_and_text_section.steps.1.description": "Everything starts here.",
      "image_and_text_section.steps.2.title": "Organize and categorize",
      "image_and_text_section.steps.2.description": "Put order in your money.",
    });
  });

  test("handles escaped quotes", async () => {
    const input = `<?php

declare(strict_types=1);

return [
  'message' => 'Don\\'t forget to save',
  'quote' => 'They said \\'hello\\'',
];`;
    const result = await parser.parse(input);
    expect(result).toEqual({
      message: "Don't forget to save",
      quote: "They said 'hello'",
    });
  });

  test("serializes simple key-value pairs", async () => {
    const input = {
      hello: "world",
      test: "value",
    };
    const result = await parser.serialize("en", input);
    expect(result).toBe(`<?php

declare(strict_types=1);

return [
    'hello' => 'world',
    'test' => 'value'
];
`);
  });

  test("serializes nested objects", async () => {
    const input = {
      "nested.key": "value",
      "nested.another.deep": "test",
    };
    const result = await parser.serialize("en", input);
    expect(result).toBe(`<?php

declare(strict_types=1);

return [
    'nested' => [
        'key' => 'value',
        'another' => [
            'deep' => 'test'
        ]
    ]
];
`);
  });

  test("serializes Laravel-style language files", async () => {
    const input = {
      "image_and_text_section.title": "Start mastering your finances!",
      "image_and_text_section.steps.1.title": "Connect your accounts",
      "image_and_text_section.steps.1.description": "Everything starts here.",
      "image_and_text_section.steps.2.title": "Organize and categorize",
      "image_and_text_section.steps.2.description": "Put order in your money.",
    };
    const result = await parser.serialize("en", input);
    expect(result).toBe(`<?php

declare(strict_types=1);

return [
    'image_and_text_section' => [
        'title' => 'Start mastering your finances!',
        'steps' => [
            '1' => [
                'title' => 'Connect your accounts',
                'description' => 'Everything starts here.'
            ],
            '2' => [
                'title' => 'Organize and categorize',
                'description' => 'Put order in your money.'
            ]
        ]
    ]
];
`);
  });

  test("escapes quotes in values", async () => {
    const input = {
      message: "Don't forget to save",
      quote: "They said 'hello'",
    };
    const result = await parser.serialize("en", input);
    expect(result).toBe(`<?php

declare(strict_types=1);

return [
    'message' => 'Don\\'t forget to save',
    'quote' => 'They said \\'hello\\''
];
`);
  });
});
