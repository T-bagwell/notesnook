/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2022 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { test, expect } from "@playwright/test";
import { AppModel } from "./models/app.model";
import { Item } from "./models/types";
import { NOTE } from "./utils";

const TAG: Item = { title: "hello-world" };
const EDITED_TAG: Item = { title: "hello-world-2" };

test("create a tag", async ({ page }) => {
  const app = new AppModel(page);
  await app.goto();
  const tags = await app.goToTags();

  const tag = await tags.createItem(TAG);

  expect(tag).toBeDefined();
});

test("create a note inside a tag", async ({ page }) => {
  const app = new AppModel(page);
  await app.goto();
  const tags = await app.goToTags();
  const tag = await tags.createItem(TAG);
  const notes = await tag?.open();

  const note = await notes?.createNote(NOTE);

  expect(note).toBeDefined();
  await notes?.newNote();
  await note?.openNote();
  const assignedTags = await notes?.editor.getTags();
  expect(assignedTags?.includes("hello-world")).toBeTruthy();
});

test("edit a tag", async ({ page }) => {
  const app = new AppModel(page);
  await app.goto();
  const tags = await app.goToTags();
  const tag = await tags.createItem(TAG);

  await tag?.editItem(EDITED_TAG);

  const editedTag = await tags.findItem(EDITED_TAG);
  expect(editedTag).toBeDefined();
});

test("delete a tag", async ({ page }) => {
  const app = new AppModel(page);
  await app.goto();
  const tags = await app.goToTags();
  const tag = await tags.createItem(TAG);

  await tag?.delete();

  expect(await app.toasts.waitForToast("1 tag deleted")).toBe(true);
  expect(await tags?.findItem(TAG)).toBeUndefined();
});

test("create shortcut of a tag", async ({ page }) => {
  const app = new AppModel(page);
  await app.goto();
  const tags = await app.goToTags();
  const tag = await tags.createItem(TAG);

  await tag?.createShortcut();

  expect(await tag?.isShortcut()).toBe(true);
  const allShortcuts = await app.navigation.getShortcuts();
  expect(allShortcuts.includes("hello-world")).toBeTruthy();
});

test("remove shortcut of a tag", async ({ page }) => {
  const app = new AppModel(page);
  await app.goto();
  const tags = await app.goToTags();
  const tag = await tags.createItem(TAG);
  await tag?.createShortcut();

  await tag?.removeShortcut();

  expect(await tag?.isShortcut()).toBe(false);
  const allShortcuts = await app.navigation.getShortcuts();
  expect(allShortcuts.includes("hello-world")).toBeFalsy();
});

test("edit a tag and make sure all its references on note are updated", async ({
  page
}) => {
  const app = new AppModel(page);
  await app.goto();
  let tags = await app.goToTags();
  let tag = await tags.createItem(TAG);
  let notes = await tag?.open();
  await notes?.createNote(NOTE);
  tags = await app.goToTags();
  tag = await tags.findItem(TAG);

  await tag?.editItem(EDITED_TAG);

  notes = await tag?.open();
  await notes?.newNote();
  const note = await notes?.findNote(NOTE);
  expect((await note?.getTags())?.includes(EDITED_TAG.title)).toBeTruthy();
  await note?.openNote();
  expect(
    (await notes?.editor.getTags())?.includes(EDITED_TAG.title)
  ).toBeTruthy();
});

test("assigning tag to a note should create a tag", async ({ page }) => {
  const app = new AppModel(page);
  await app.goto();
  const notes = await app.goToNotes();
  await notes.createNote(NOTE);

  await notes.editor.setTags([TAG.title]);

  const tags = await app.goToTags();
  expect(await tags.findItem(TAG)).toBeDefined();
});

test("delete a tag and make sure all associated notes are untagged", async ({
  page
}) => {
  const app = new AppModel(page);
  await app.goto();
  let notes = await app.goToNotes();
  await notes.createNote(NOTE);
  await notes.editor.setTags([TAG.title]);
  const tags = await app.goToTags();
  const tag = await tags.findItem(TAG);

  await tag?.delete();

  notes = await app.goToNotes();
  const note = await notes.findNote(NOTE);
  expect((await note?.getTags())?.includes(TAG.title)).toBeFalsy();
  await note?.openNote();
  expect((await notes?.editor.getTags())?.includes(TAG.title)).toBeFalsy();
});

test("delete the last note of a tag that is also a shortcut", async ({
  page
}) => {
  const app = new AppModel(page);
  await app.goto();
  let notes = await app.goToNotes();
  await notes.createNote(NOTE);
  await notes.editor.setTags([TAG.title]);
  const tags = await app.goToTags();
  const tag = await tags.findItem(TAG);
  await tag?.createShortcut();
  notes = await app.goToNotes();
  const note = await notes.findNote(NOTE);

  await note?.contextMenu.moveToTrash();

  expect(await app.getRouteHeader()).toBe("Notes");
});
