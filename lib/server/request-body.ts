import { NextRequest, NextResponse } from 'next/server';

export type ReadJsonBodyResult =
	| { ok: true; data: unknown }
	| { ok: false; response: NextResponse };

export async function readJsonBodyWithLimit(request: NextRequest, maxBytes: number): Promise<ReadJsonBodyResult> {
	const contentLengthHeader = request.headers.get('content-length');
	if (contentLengthHeader) {
		const contentLength = Number(contentLengthHeader);
		if (Number.isFinite(contentLength) && contentLength > maxBytes) {
			return {
				ok: false,
				response: NextResponse.json({ error: 'Payload Too Large' }, { status: 413 }),
			};
		}
	}

	const reader = request.body?.getReader();
	if (!reader) {
		return {
			ok: false,
			response: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }),
		};
	}

	let receivedBytes = 0;
	const chunks: Uint8Array[] = [];

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		if (!value) continue;

		receivedBytes += value.byteLength;
		if (receivedBytes > maxBytes) {
			return {
				ok: false,
				response: NextResponse.json({ error: 'Payload Too Large' }, { status: 413 }),
			};
		}

		chunks.push(value);
	}

	if (receivedBytes === 0) {
		return {
			ok: false,
			response: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }),
		};
	}

	const bodyBytes = new Uint8Array(receivedBytes);
	let offset = 0;
	for (const chunk of chunks) {
		bodyBytes.set(chunk, offset);
		offset += chunk.byteLength;
	}

	const text = new TextDecoder().decode(bodyBytes);
	if (text.trim().length === 0) {
		return {
			ok: false,
			response: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }),
		};
	}

	try {
		const data = JSON.parse(text) as unknown;
		return { ok: true, data };
	} catch {
		return {
			ok: false,
			response: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }),
		};
	}
}
