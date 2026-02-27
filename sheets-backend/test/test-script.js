import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '1s',
};

export default function () {
  const url = 'https://sheet.gofo.app/record/v2/get_records';
  const token =
    'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJEN0t1VlR0eEQ3a2pUbEFkb3Q0WVFMTk90UUNEWWJGZnFEeU9URGJ3VWdjIn0.eyJleHAiOjE3NDg2NzUyNzIsImlhdCI6MTc0MzY2OTI2MiwiYXV0aF90aW1lIjoxNzQwMDM1MjcyLCJqdGkiOiJkZTk5ZDdmZS0wMTc3LTQyM2MtOWZjMi04M2I1NTA5OTE3Y2QiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvZm8uYXBwL3JlYWxtcy9vdXRlIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjhlZThjNDUxLTM0YjItNDRkYS04ZDFmLTE3OTMxMzI0ODQ4ZiIsInR5cCI6IkJlYXJlciIsImF6cCI6Im91dGUtaWMtY2FudmFzIiwic2lkIjoiMWFkMWJkZTctODE0YS00Y2Q1LWI3MDItNTc0ZTUxNDY3OWIxIiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL291dGUuYXBwIiwiaHR0cHM6Ly91bHRpbWF0ZS1zaGVldC1zaGFyaW5nLmQyYXk5ZTlxaDE4aXUyLmFtcGxpZnlhcHAuY29tIiwiaHR0cHM6Ly93Y2wub3V0ZS5hcHAiLCJodHRwczovL2ZjLWVjMi5vdXRlLmFwcCIsImh0dHBzOi8vY2FudmFzLXYyLmQzamd5c2R1NzJidGl6LmFtcGxpZnlhcHAuY29tIiwiaHR0cHM6Ly9pY2Mub3V0ZS5hcHAiLCJodHRwOi8vbG9jYWxob3N0OjUxNzMiLCJodHRwczovL21haWwub3V0ZS5hcHAiLCJodHRwczovL2hhbmRsZS1vYXV0aC5vdXRlLmFwcCIsImh0dHBzOi8vY29udGVudC5vdXRlLmFwcCIsImh0dHBzOi8vY29tbWFuZGJhci1wb2MuZDNqZ3lzZHU3MmJ0aXouYW1wbGlmeWFwcC5jb20iLCJodHRwczovL2ljbC5vdXRlLmFwcCIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMiIsImh0dHBzOi8vaWMub3V0ZS5hcHAiLCJodHRwczovL3V4bWFpbC5vdXRlLmFwcCIsImh0dHBzOi8vdGVtcGxhdGUub3V0ZS5hcHAiLCJodHRwczovL2NoYW5kLXByYXRpay5kMWtra3d0eDc3Z2s2aC5hbXBsaWZ5YXBwLmNvbSIsImh0dHBzOi8vZGV2ZWxvcC5kM2NyMTRvajhzam1tYS5hbXBsaWZ5YXBwLmNvbSIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSIsImh0dHBzOi8vY21zLm91dGUuYXBwIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIiwiaHR0cHM6Ly9zaGVldHMub3V0ZS5hcHAiLCJodHRwczovL2NodW5rLXJldmVydC5kM2pneXNkdTcyYnRpei5hbXBsaWZ5YXBwLmNvbSIsImh0dHBzOi8vY29udGVudC5nb2ZvLmFwcCIsImh0dHBzOi8vZmMub3V0ZS5hcHAiLCJodHRwczovL3djLm91dGUuYXBwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImRlZmF1bHQtcm9sZXMtb3V0ZSIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwiZGVsZXRlLWFjY291bnQiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiQWJoYXkgR3VwdGEiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhYmhheS5ndXB0YUBpbnN0aW5jdGlubm92YXRpb25zLmNvbSIsImdpdmVuX25hbWUiOiJBYmhheSIsImZhbWlseV9uYW1lIjoiR3VwdGEiLCJlbWFpbCI6ImFiaGF5Lmd1cHRhQGluc3RpbmN0aW5ub3ZhdGlvbnMuY29tIn0.TVXHFgUJnxBC-1_JwUB_b44tfouR4YvHZHSPDaIR_9WfANUC9KA3hVbJdM7yUI77Xn55y2dZUX49GnSJOHR8f83RLIF8v0LubeMlK01tKuB0mBl5rytxaLM2cdFJ3XmAJyE46XXy_Y27La0ErSkckGlzqNYYg5rt8AqEOMcrlslfZcy2m27oem-t9P1jBiBug_d3c5_Z87zM0lZrp81JsN5726QFykN46MYJlAGjJ1t-MO9MQS0UIIfsC5jH-WTzZ9Yvgqe-j6NiSBxY3PerQ3Z2_TPkirKvMhgG7kB16UJZK7U2TgdNrS6n1PSx7V7pucgsRQGUt9hU3F33XiMYjA';

  const headers = {
    'Content-Type': 'application/json',
    token: `${token}`,
  };

  const body = {
    tableId: 'cm5qfj6zp00522qm1q5fjlu8i',
    baseId: 'np0FNMIwR',
    viewId: 'cm5qfj72800532qm1xyo9x70z',
    is_field_required: true,
    limit: 10,
    manual_filters: {
      id: '1737356843228_',
      condition: 'and',
      childs: [
        {
          id: '1737356843228',
          key: 'when is ur interview',
          field: 19821,
          type: 'SHORT_TEXT',
          operator: {
            key: 'ilike',
            value: 'contains...',
          },
          value: 'a',
        },
      ],
    },
    manual_sort: {
      sortObjs: [
        {
          fieldId: 21382,
          order: 'desc',
          dbFieldName: 'name',
          type: 'SHORT_TEXT',
        },
      ],
      manualSort: false,
    },
    should_stringify: true,
  };

  const res = http.post(url, JSON.stringify(body), { headers: headers });

  check(res, {
    'status is 201': (r) => r.status === 201,
  });

  // Log the response details if it's not 200
  if (res.status !== 201) {
    console.log(`Request failed with status: ${res.status}`);
    console.log(`Response body: ${res.body}`);
  }
}
