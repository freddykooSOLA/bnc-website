import { jsonLdScriptProps } from '@/lib/json-ld';

interface JsonLdProps {
  data: object | object[];
}

export default function JsonLd({ data }: JsonLdProps) {
  return <script {...jsonLdScriptProps(data)} />;
}
