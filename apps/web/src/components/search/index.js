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

import * as Icon from "../icons";
import "./search.css";
import Field from "../field";

function SearchBox(props) {
  return (
    <Field
      autoFocus
      id="search"
      name="search"
      type="text"
      sx={{ mx: 2, mb: 2 }}
      placeholder="Type your query here"
      onKeyDown={(e) => {
        if (e.key === "Enter") props.onSearch(e.target.value);
      }}
      action={{
        icon: Icon.Search,
        onClick: () => {
          const searchField = document.getElementById("search");
          if (searchField && searchField.value && searchField.value.length) {
            props.onSearch(searchField.value);
          }
        }
      }}
    />
  );
}
export default SearchBox;
