import { DateTime } from 'luxon';
import slugify from 'slugify';
import site from '../src/_data/site.js';

const WORDS_PER_MINUTE = 200;

/** Converts the given string to a slug form.
 * @param {string} str
 */
export const slugifyString = (str) => {
  return slugify(String(str), {
    replacement: '-',
    remove: /[#,&,+()$~%.'":*?<>{}]/g,
    lower: true,
  });
};

/** Formats the given url as an absolute url.
 * @param {string} url
 * @param {string} [baseUrl]
 */
export const toAbsoluteUrl = (url, baseUrl = site.url) => {
  return new URL(url, baseUrl).href;
};

/** Converts the given date string to ISO8601 format.
 * @param {Date|string} date
 */
export const toISOString = (date) => new Date(date).toISOString();

/** Formats a date for human-readable display, e.g. "August 13, 2026".
 * @param {Date|string} date
 */
export const readableDate = (date) => {
  return DateTime.fromJSDate(new Date(date), { zone: 'utc' }).toFormat('LLLL d, yyyy');
};

/** Formats a date as YYYY-MM-DD for use in <time datetime="">.
 * @param {Date|string} date
 */
export const machineDate = (date) => {
  return DateTime.fromJSDate(new Date(date), { zone: 'utc' }).toFormat('yyyy-LL-dd');
};

/** Estimates reading time in minutes for the given HTML/plain text content.
 * @param {string} content
 */
export const readingTime = (content = '') => {
  const text = String(content).replace(/<[^>]*>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return minutes;
};

/** Returns the first `limit` items of an array. */
export const limit = (array, limit) => array.slice(0, limit);

/** Filters a tag list down to publicly listed tags (excludes internal bookkeeping tags). */
export const publicTags = (tags = [], excludedTags = []) => {
  return tags.filter((tag) => !excludedTags.includes(tag));
};

/** Formats a date as RFC 822 (used by <pubDate>/<lastBuildDate> in RSS 2.0 feeds).
 * @param {Date|string} date
 */
export const rfc822Date = (date) => {
  return DateTime.fromJSDate(new Date(date), { zone: 'utc' }).toRFC2822();
};

/** Returns the most recent `date` across a collection of Eleventy pages.
 * @param {{ date: Date }[]} collection
 */
export const newestDate = (collection = []) => {
  return collection.reduce((newest, item) => (item.date > newest ? item.date : newest), new Date(0));
};
