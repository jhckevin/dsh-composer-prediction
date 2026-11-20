import {validateReasoningControl} from './reasoning-policy.mjs';
import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute, extname } from 'node:path';
import { createHash } from 'node:crypto';

const PROTOCOLS = new Set(['deepseek-messages', 'responses', 'anthropic-messages', 'chat-completions', 'codex-native']);
const SECRET_KEYS = /^(api[_-]?key|x[-_]api[-_]key|access[_-]?token|auth[-_]?token|x[-_]auth[-_]token|authorization|proxy[-_]authorization|cookie|set[-_]cookie|password|secret)$/i;
const fail = (message) => { throw new Error(message); };
export function canonicalJSON(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalJSON).join(',') + ']';
  return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonicalJSON(value[k])).join(',') + '}';
}
export function digest(value) { return createHash('sha256').update(canonicalJSON(value)).digest('hex'); }
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function object(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(name + ' must be an object');
}
function text(value, name) {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) fail(name + ' must be a nonempty string');
}
function noEmbeddedSecrets(value, path = 'profile') {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (SECRET_KEYS.test(key)) fail(path + '.' + key + ': embedded credentials are forbidden; use credential.env or credential.secretRef');
    noEmbeddedSecrets(child, path + '.' + key);
  }
}
function validatePricing(book) {
  object(book, 'pricing');
  if (!Array.isArray(book.versions) || !book.versions.length) fail('pricing.versions must be nonempty');
  const ids = new Set();
  for (const v of book.versions) {
    object(v, 'price version'); text(v.id, 'price version id');
    if (ids.has(v.id)) fail('duplicate price version id'); ids.add(v.id);
    if (typeof v.effectiveFrom !== 'string' || !/(?:Z|[+-]\d\d:\d\d)$/.test(v.effectiveFrom) || !Number.isFinite(Date.parse(v.effectiveFrom))) fail('invalid effectiveFrom: explicit UTC offset required');
    if (v.effectiveUntil !== undefined && (typeof v.effectiveUntil !== 'string' || !/(?:Z|[+-]\d\d:\d\d)$/.test(v.effectiveUntil) || !Number.isFinite(Date.parse(v.effectiveUntil)) || Date.parse(v.effectiveUntil) <= Date.parse(v.effectiveFrom))) fail('invalid effectiveUntil');
    if (typeof v.currency !== 'string' || !/^[A-Z]{3}$/.test(v.currency)) fail('currency must be an ISO-style uppercase code');
    object(v.rates, 'rates');
    for (const key of ['input', 'cacheRead', 'output']) if (!Number.isFinite(v.rates[key]) || v.rates[key] < 0) fail('invalid rate ' + key);
    if (v.rates.cacheWrite !== undefined && (!Number.isFinite(v.rates.cacheWrite) || v.rates.cacheWrite < 0)) fail('invalid cacheWrite rate');
    if (v.schedule !== undefined) {
      object(v.schedule, 'schedule');
      if (!['flat', 'deepseek-cn-peak', 'weekly'].includes(v.schedule.type)) fail('unsupported schedule type');
      if (v.schedule.offPeakMultiplier !== undefined && (!Number.isFinite(v.schedule.offPeakMultiplier) || v.schedule.offPeakMultiplier < 0)) fail('invalid offPeakMultiplier');
      if (v.schedule.type === 'weekly') {
        text(v.schedule.timeZone, 'schedule.timeZone');
        try { new Intl.DateTimeFormat('en', { timeZone: v.schedule.timeZone }).format(); } catch { fail('invalid timeZone'); }
        if (!Array.isArray(v.schedule.weekdays) || !v.schedule.weekdays.length || v.schedule.weekdays.some(x => !Number.isInteger(x) || x < 0 || x > 6)) fail('invalid weekdays');
        if (!Array.isArray(v.schedule.windows) || !v.schedule.windows.length || v.schedule.windows.some(w => !Array.isArray(w) || w.length !== 2 || w.some(t => !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t)))) fail('invalid windows');
      }
      const c = v.schedule.calendar;
      if (c !== undefined) {
        object(c, 'calendar');
        if (!Array.isArray(c.coverageYears) || c.coverageYears.some(y => !Number.isInteger(y) || y < 2000 || y > 2200)) fail('invalid calendar coverageYears');
        if (!Array.isArray(c.dates) || c.dates.some(d => !/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isFinite(Date.parse(d + 'T00:00:00Z')) || new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) !== d || !c.coverageYears.includes(Number(d.slice(0, 4))))) fail('invalid calendar dates or coverage');
        text(c.sourceUrl, 'calendar.sourceUrl');
      }
    }
  }
  const sorted = [...book.versions].sort((a,b) => Date.parse(a.effectiveFrom) - Date.parse(b.effectiveFrom));
  for (let i = 1; i < sorted.length; i++) {
    if (Date.parse(sorted[i].effectiveFrom) === Date.parse(sorted[i - 1].effectiveFrom)) fail('ambiguous effectiveFrom');
    if (sorted[i - 1].effectiveUntil && Date.parse(sorted[i].effectiveFrom) < Date.parse(sorted[i - 1].effectiveUntil)) fail('overlapping price versions');
  }
}
export function validateProfile(raw, { filePath } = {}) {
  object(raw, 'profile');
  const p = structuredClone(raw);
  noEmbeddedSecrets(p);
  if (p.version !== 1) fail('profile.version must equal 1');
  if (typeof p.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}$/.test(p.id)) fail('invalid profile id');
  p.label ??= p.id; text(p.label, 'label');
  if (!PROTOCOLS.has(p.protocol)) fail('unsupported protocol');
  text(p.model, 'model'); text(p.accountId, 'accountId');
  if (p.protocol !== 'codex-native' || p.baseURL !== undefined) {
    text(p.baseURL, 'baseURL');
    let u; try { u = new URL(p.baseURL); } catch { fail('invalid baseURL'); }
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname);
    if (u.protocol !== 'https:' && !(u.protocol === 'http:' && local)) fail('baseURL requires HTTPS, except loopback');
    if (u.username || u.password || u.search || u.hash) fail('baseURL may not contain userinfo, query, or fragment');
    p.baseURL = u.toString().replace(/\/+$/, '');
  }
  if (p.protocol !== 'codex-native' && p.credential === undefined) fail('credential reference required');
  if (p.credential !== undefined) {
    object(p.credential, 'credential');
    const keys = Object.keys(p.credential);
    if (keys.length !== 1 || !['env', 'secretRef'].includes(keys[0])) fail('credential must contain exactly env or secretRef');
    text(p.credential[keys[0]], 'credential reference');
    if (keys[0] === 'env' && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(p.credential.env)) fail('invalid credential environment variable');
  }
  p.request ??= {}; p.cache ??= {};
  object(p.request, 'request'); object(p.cache, 'cache');
  if(p.reasoningControl!==undefined)validateReasoningControl(p.reasoningControl);
  if(p.capabilities!==undefined){
    object(p.capabilities,'capabilities');
    const booleans=['cacheKey','cacheRetention','reasoning','temperature','tools','storage','background'];
    for(const [key,value] of Object.entries(p.capabilities)){
      if(booleans.includes(key)){if(typeof value!=='boolean')fail('capabilities.'+key+' must be boolean');}
      else if(key==='responseMode'){if(!['json','sse'].includes(value))fail('invalid responseMode');if(p.protocol!=='responses'&&value!=='json')fail('generic Messages/Chat require JSON responseMode');}
      else if(key==='auth'){if(!['bearer','x-api-key'].includes(value))fail('invalid auth');}
      else if(key==='usage'){if(!['native','totals-only'].includes(value))fail('invalid usage mode');}
      else fail('unknown capability '+key);
    }
  }
  if(p.mainRoute!==undefined){
    object(p.mainRoute,'mainRoute');text(p.mainRoute.provider,'mainRoute.provider');text(p.mainRoute.model,'mainRoute.model');
    if(['deepseek','deepseek-official'].includes(p.mainRoute.provider)){
      if(!p.mainRoute.baseURL||new URL(p.mainRoute.baseURL).origin==='https://api.deepseek.com')fail('mainRoute cannot replace official pricebooks');
    }
    if(p.mainRoute.baseURL!==undefined)text(p.mainRoute.baseURL,'mainRoute.baseURL');
  }
  if (p.pricing !== undefined) validatePricing(p.pricing);
  // Computed metadata cannot be supplied by a config file.
  delete p.digest; delete p.filePath;
  const hash = digest(p);
  return freeze({ ...p, digest: hash, ...(filePath ? { filePath } : {}) });
}
export function publicProfile(profile) {
  const p = structuredClone(profile);
  if (p.credential) p.credential = { configured: true, kind: p.credential.env ? 'env' : 'secretRef' };
  // The public/settings view deliberately exposes no OS path or secret reference.
  delete p.filePath;
  return freeze(p);
}
export function profileCacheScope(profile, parentConfig = {}) {
  // The reference identity partitions accounts without persisting credential values.
  return digest({
    profileId: profile.id, protocol: profile.protocol, endpoint: profile.baseURL ?? 'codex-native',
    accountId: profile.accountId, credential: profile.credential ?? null, model: profile.model,
    request: profile.request ?? {}, cache: profile.cache ?? {}, ...(profile.reasoningControl!==undefined?{reasoningControl:profile.reasoningControl}:{}), ...(profile.capabilities!==undefined?{capabilities:profile.capabilities}:{}), parentConfig
  });
}
async function checkedFile(file, allowedRoots) {
  const actual = await realpath(file);
  let allowed = false;
  for (const root of allowedRoots) {
    const base = await realpath(root); const rel = relative(base, actual);
    if (!rel.startsWith('..' + (process.platform === 'win32' ? '\\' : '/')) && rel !== '..' && !isAbsolute(rel)) { allowed = true; break; }
  }
  if (!allowed) fail('profile file is outside allowed roots');
  if (extname(actual).toLowerCase() !== '.json') fail('profile must be a JSON file');
  const info = await stat(actual);
  if (!info.isFile() || info.size > 262144) fail('profile must be a regular JSON file no larger than 256 KiB');
  return actual;
}
export async function loadProfileFile(file, { allowedRoots = [resolve(file, '..')] } = {}) {
  const actual = await checkedFile(file, allowedRoots);
  const data = await readFile(actual, 'utf8');
  if (Buffer.byteLength(data) > 262144) fail('profile exceeds size limit');
  let parsed;
  try { parsed = JSON.parse(data.replace(/^\uFEFF/, '')); } catch { fail('profile contains invalid JSON'); }
  return validateProfile(parsed, { filePath: actual });
}
export class ProfileManager {
  #selected = null;
  constructor({ directory, allowedRoots = [directory], secretResolver, env = process.env }) {
    text(directory, 'directory');
    this.directory = resolve(directory); this.allowedRoots = allowedRoots; this.secretResolver = secretResolver; this.env = env;
  }
  async list() {
    const names = (await readdir(this.directory, { withFileTypes: true })).filter(x => (x.isFile() || x.isSymbolicLink()) && x.name.endsWith('.json')).map(x => x.name).sort();
    const profiles = await Promise.all(names.map(name => loadProfileFile(resolve(this.directory, name), { allowedRoots: this.allowedRoots })));
    if (new Set(profiles.map(p => p.id)).size !== profiles.length) fail('duplicate profile ids');
    return profiles.map(publicProfile);
  }
  async select(idOrFile) {
    text(idOrFile, 'profile selection');
    // Settings may select a discovered id or a JSON path inside approved roots.
    let selected;
    if (idOrFile.endsWith('.json')) selected = await loadProfileFile(resolve(this.directory, idOrFile), { allowedRoots: this.allowedRoots });
    else {
      for (const entry of await readdir(this.directory, { withFileTypes: true })) {
        if ((!entry.isFile() && !entry.isSymbolicLink()) || !entry.name.endsWith('.json')) continue;
        const p = await loadProfileFile(resolve(this.directory, entry.name), { allowedRoots: this.allowedRoots });
        if (p.id === idOrFile) { if (selected) fail('duplicate profile id'); selected = p; }
      }
      if (!selected) fail('profile not found');
    }
    this.#selected = selected; return publicProfile(selected);
  }
  async reload() {
    if (!this.#selected) fail('no selected profile');
    // Only replace the last valid snapshot after full validation succeeds.
    const next = await loadProfileFile(this.#selected.filePath, { allowedRoots: this.allowedRoots });
    this.#selected = next; return publicProfile(next);
  }
  current() { return this.#selected; }
  publicCurrent() { return this.#selected ? publicProfile(this.#selected) : null; }
  async resolveCredential(profile = this.#selected) {
    if (!profile) fail('no selected profile');
    if (!profile.credential) return undefined;
    const value = profile.credential.env
      ? this.env[profile.credential.env]
      : (this.secretResolver ? await this.secretResolver(profile.credential.secretRef) : undefined);
    if (typeof value !== 'string' || !value.trim()) fail('credential reference is unavailable');
    return value;
  }
}
