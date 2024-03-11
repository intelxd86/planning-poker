## Planning poker

Planning Poker is a collaborative estimation technique often used by agile development teams, particularly those following the Scrum framework. It helps teams estimate their work more effectively by facilitating a group discussion and consensus on task complexities.

This project is built with Laravel 10.x (backend) and ReactJS (UI).

## How it works

- User creates room and becomes room operator (OP), rooms are identified by UUID
- OP provides link with room UUID to other users, anyone with link can join
- Any user that wants to watch the game but not participate can become spectator
- User creates card deck with values of game cards (usually corresponding to effort estimates (EE) or man-days (MD))
- OP creates planning poker game (game must have predefined card deck). From now on users can pick the card they want. When user picks the card an information is shown to other users.
- OP ends the game when everyone is ready or OP decides to do so anyway. Users cards are revealed and average, mean, min and max value are calculated.
- OP can create another game if needed