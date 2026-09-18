/**
 * OSC (Open Sound Control) 1.0 Packet Builder for VRChat Chatbox
 * Fully compliant with standard 4-byte boundary padding.
 */

function pad4(len: number): number {
  const rem = len % 4;
  return rem === 0 ? 0 : 4 - rem;
}

function writePaddedString(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const nullCount = 1 + pad4(bytes.length + 1); // at least 1 null byte, then pad to 4 bytes
  const total = bytes.length + nullCount;
  const out = new Uint8Array(total);
  out.set(bytes, 0);
  // Rest are already 0s
  return out;
}

/**
 * Encodes a VRChat Chatbox message:
 * Address: "/chatbox/input"
 * Args:
 * - text (string)
 * - bypassTyping (boolean)
 * - playSound (boolean)
 */
export function encodeVRChatChatboxInput(
  text: string,
  bypassTyping: boolean = true,
  playSound: boolean = false
): Uint8Array {
  // OSC Address
  const addrBytes = writePaddedString('/chatbox/input');

  // OSC Type tag: Using 'T' or 'F' (True/False OSC type tags) which require 0 payload bytes in OSC 1.0
  const typeTagStr = `,s${bypassTyping ? 'T' : 'F'}${playSound ? 'T' : 'F'}`;
  const typeTagBytes = writePaddedString(typeTagStr);

  // Payload: text string padded
  const textBytes = writePaddedString(text);

  const totalLen = addrBytes.length + typeTagBytes.length + textBytes.length;
  const packet = new Uint8Array(totalLen);

  let offset = 0;
  packet.set(addrBytes, offset);
  offset += addrBytes.length;

  packet.set(typeTagBytes, offset);
  offset += typeTagBytes.length;

  packet.set(textBytes, offset);
  offset += textBytes.length;

  return packet;
}

/**
 * Encodes VRChat Chatbox typing indicator:
 * Address: "/chatbox/typing"
 * Args: [typing: boolean]
 */
export function encodeVRChatChatboxTyping(typing: boolean): Uint8Array {
  const addrBytes = writePaddedString('/chatbox/typing');
  const typeTagBytes = writePaddedString(typing ? ',T' : ',F');

  const totalLen = addrBytes.length + typeTagBytes.length;
  const packet = new Uint8Array(totalLen);
  packet.set(addrBytes, 0);
  packet.set(typeTagBytes, addrBytes.length);
  return packet;
}
