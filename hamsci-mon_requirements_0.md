## Deno flow-dash requirements
#### 2025-11-03

This project is intended to serve as a dynamic graphical status monitoring application.
 

* Runtime:  Stable, 2.4+.

* HTTP framework: Deno.serve.

* Permissions model: Broad during dev.

* Testing expectations: Unit testing.

* Lint/format: use custom rules.

* Deployment target: Deno Deploy.

* Env/secrets: Nothing at this time.

I want to build a standalone application that follows the pattern of  Google Earth and similar applications that present a wirefarme globe showing continents, islands, and political boundaries. I would also want to see major lattitude and longitude demarcations displayed appropriately for a given zoom level.  I anticipate that this presentation will be rendered with something like D3.js and will allow zooming, panning and 3d rotation using either mouse or keyboard actions.

Objects in a palette onto the workspace and their properties can be edited to attach their position to the globe (or above it) by specification of lattitude, longitude, and elevation.  The objects will also contain an element for object-name, object-id, object-owner, object-type, maidenhead grid-square, current-state, time-last-seen, and potentially other operator notes.  When a mouse hovers above a given object, a box should appear to display these internal parameters.

The entire interface should have a single-row menu (left aligned), a single-row toolbar (left aligned), and a status bar.  The status bar should indicate local lattitude and local longitude, and local time in seperate small windows. It must be realizable to fit the screen, minimizeable, or hidden. It should also indicate current UTC time in "HH:MM:SS DD/MM/YYYY" format at the current mouse location on the globe (if any) in a small statusbar window at the far right.  

The toolbar should have buttons for "New", "Save", "Save As".
The menubar should have conventional drop-downs for "File", "Edit", "Tools", and "Help".

The pallet will present objects made available in a file named palette_objects.json.  This file will contain minimal descriptions of objects including the object's guid, a unique hash of the object's definition file to maintain integrity, the name to be displayed under the object in the palette and on the workspace, and an ordinal number that indicates where the palette entry is located in the palette. There should also be a reference to an .svg file that will appear on the palette button's surface for selection.

The objects themselves will be defined in individual <*>_obj.json where <*> represents a same guid that references it in the palette_objects.json file. All of these object definition files should be stored in a directory "./obj" relative to the project's root.

The overall interface will be able to open and save, and close files located in the directory "./projects" (relative to the project root).
Project files will be named <*>_prj.json and the names will be unique.
These files will contain JSON format lists of the objects in the workspace, their relative position within the workspace and their source and sink targets (targets may be multiple).

Upon loading a particular *_prj.json file, the system will close any previously open project file, clear the workspace canvas, Load the new file, and position its objects according their stored locations and connect any source and sink connectors using narrow bezier lines with small arrowheads showing data flow direction.  This representation should reflect the state at the time it was last saved.

The entire interface must present a toolbar option (at the right side of the toolbar) that allows the choice of light-mode/dark-mode options that take effect on selection.  This styling shall apply to all interface elements including menus, sub-menus, pallette windows and popups.

I anticipate that these requirements will be extended, particularly with data received from either an MQTT broker or via WebSockets connections  that provide status information concerning the displayed objects in the near future. 