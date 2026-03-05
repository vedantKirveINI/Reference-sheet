const getCurlObj = ({ searchTerm, settings }) => {
  if (settings?.useCase === "Restro Menu") {
    return {
      type: "fx",
      blocks: [
        {
          type: "PRIMITIVES",
          value:
            "curl --location 'https://sheet.gofo.app/record/public/get_records' \\",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "--header 'Content-Type: application/json' \\",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "--data '{",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '    "tableId": "cm6hqnrwb014scghs71j71x3f",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '    "baseId": "e7VG7B3Ks",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '    "viewId": "cm6hqnrye014tcghsvf642erp",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '    "is_field_required": false,',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '    "limit": 10,',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '    "manual_filters": {',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '    "id": "1738146522780_",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '    "condition": "and",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '    "childs": [',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "        {",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "id": "1738146522780",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "key": "Restaurant Id",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "field": 23108,',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "type": "SHORT_TEXT",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "operator": {',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '                "key": "=",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '                "value": "is..."',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "            },",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "value": "3"',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "        },",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "        {",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "id": "1738146527939",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "key": "Name",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "field": 23103,',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "type": "SHORT_TEXT",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '            "operator": {',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '                "key": "ilike",',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: '                "value": "contains..."',
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "            },",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: `            "value": "${searchTerm}"`,
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "        }",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "    ]",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "}",
        },
        {
          type: "BREAKLINE",
          value: "\n",
        },
        {
          type: "PRIMITIVES",
          value: "}'",
        },
      ],
    };
  }
  if (settings?.useCase === "Menu") {
    return {
      type: "fx",
      blocks: [
        {
          type: "PRIMITIVES",
          value: `curl --location 'https://dummyjson.com/recipes/search?q=${searchTerm}'`,
        },
      ],
    };
  }

  if (settings?.useCase === "Sheet") {
    return {
      type: "fx",
      blocks: [
        {
          type: "PRIMITIVES",
          value: `curl --location 'https://sheet.gofo.app/record/public/get_records' \
--header 'Content-Type: application/json' \
--data '{
    "tableId": "cm6hi2xmc023mwoqoaoi7q02b",
    "baseId": "c6mP89bRB",
    "viewId": "cm6hi2xq2023nwoqo7qwnu7de",
    "is_field_required": false,
    "limit": 100
}'`,
        },
      ],
    };
  }

  return {};
};
export { getCurlObj };
