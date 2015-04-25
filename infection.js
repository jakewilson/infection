var gridWidth = 100,
    gridHeight = 100,
    cellWidth = 4,
    cellHeight = 4,
    grid, // the grid
    context, // the drawing context
    stopStepping = false,
    state = {
        ALIVE: 0,
        IMMUNE: 1,
        INFECTED: 2,
        VACCINATED: 3
    },
    infectedCells = [], // array of infected cells
    newlyInfectedCells = []; // array of newly infected cells on the next iteration


var intervalID;
var running = false;
var waitInterval = 200;
var numSteps = 0;
var VACCINATION_STEP = 10;

function Cell(x, y, s)
{
    this.x = x;
    this.y = y;
    this.w = cellWidth;
    this.h = cellHeight;
    this.state = s;
    this.draw = function(ctx)
    {
        ctx.fillStyle = 'rgb(0, 0, 0)';
        switch (this.state)
        {
            case state.ALIVE:
                ctx.fillStyle = 'rgb(200, 200, 200)';
                break;
            case state.IMMUNE:
                ctx.fillStyle = 'rgb(0, 0, 200)';
                break;
            case state.INFECTED:
                ctx.fillStyle = 'rgb(200, 0, 0)';
                break;
            case state.VACCINATED:
                ctx.fillStyle = 'rgb(0, 200, 0)';
                break;
        }
        ctx.fillRect(this.x * this.w, this.y * this.h, this.w, this.h);
    };
}

function Grid(w, h)
{
    this.count = 0;
    this.w = w;
    this.h = h;
    this.init = function()
    {
        this.grid = [];
        for (var i = 0; i < h; i++)
        {
            this.grid[i] = [];
            for (var j = 0; j < w; j++)
            {
                this.grid[i][j] = new Cell(j, i, state.ALIVE);
            }
        }
        // immunize 5% of population
        for (var i = 0; i < Math.floor((w * h) / 2); i++)
        {
            this.grid[Math.floor(Math.random() * h)][Math.floor(Math.random() * w)].state = state.IMMUNE;
        }

        var infected = false;
        // infect a random cell
        do {
            var cell = this.grid[Math.floor(Math.random() * h)][Math.floor(Math.random() * w)];
            if (cell.state == state.ALIVE)
            {
                cell.state = state.INFECTED;
                infectedCells.push(cell);
                infected = true;
            }
        } while (!infected);
    };

    this.draw = function(ctx)
    {
        for (var i = 0; i < h; i++)
        {
            for (var j = 0; j < w; j++)
            {
                this.grid[i][j].draw(ctx);
            }
        }
    };

    this.step = function(ctx)
    {
        var i, j;
        for (i = 0; i < infectedCells.length; i++)
        {
            next(infectedCells[i]); // populate the newlyInfectedCells list
        }
        infectedCells = infectedCells.concat(newlyInfectedCells);
        for (i = 0; i < newlyInfectedCells.length; i++)
        {
            newlyInfectedCells[i].draw(ctx);
        }
        newlyInfectedCells = [];
        //this.draw(ctx);
    };

}

/**
 * Returns the state of a cell in the next generation
 */
function next(cell)
{
    if (!outOfBounds(cell.y + 1, cell.x))
    {
        var c = grid.grid[cell.y + 1][cell.x];
        if (c.state == state.ALIVE)
        {
            c.state = state.INFECTED;
            newlyInfectedCells.push(c);
        }
    }
    if (!outOfBounds(cell.y - 1, cell.x))
    {
        var c = grid.grid[cell.y - 1][cell.x];
        if (c.state == state.ALIVE)
        {
            c.state = state.INFECTED;
            newlyInfectedCells.push(c);
        }
    }
    if (!outOfBounds(cell.y, cell.x + 1))
    {
        var c = grid.grid[cell.y][cell.x + 1];
        if (c.state == state.ALIVE)
        {
            c.state = state.INFECTED;
            newlyInfectedCells.push(c);
        }
    }
    if (!outOfBounds(cell.y, cell.x - 1))
    {
        var c = grid.grid[cell.y][cell.x - 1];
        if (c.state == state.ALIVE)
        {
            c.state = state.INFECTED;
            newlyInfectedCells.push(c);
        }
    }
}

/**
 * Returns true if the index (i, j) is out of bounds.
 */
function outOfBounds(i, j)
{
    return (i < 0 || i >= gridHeight) || (j < 0 || j >= gridWidth);
}

// Simulates one time step
function timeStep()
{
    numSteps++;
    if (++numSteps > VACCINATION_STEP)
        vaccinate();
    grid.step(context);
}

function step()
{
    if (!running)
        timeStep();
}

// Contionuously steps until the user clicks 'stop'
function start()
{
    running = true;
    intervalID = setInterval(timeStep, waitInterval);
}

function stop()
{
    running = false;
    clearInterval(intervalID);
}

function vaccinate()
{
    // find an alive cell with an immune cell on either side of it
    var vaccinated = false;
    do {
        var cell = grid.grid[Math.floor(Math.random() * grid.h)][Math.floor(Math.random() * grid.w)];
        if (cell.state === state.ALIVE)
        {
            cell.state = state.VACCINATED;
            cell.draw(context);
            vaccinated = true;
        }
    } while (!vaccinated);
}

function init()
{
    var canvas = document.createElement('canvas');
    canvas.width = gridWidth * cellWidth;
    canvas.height = gridHeight * cellHeight;
    document.body.appendChild(canvas);
    context = canvas.getContext('2d');
    grid = new Grid(gridWidth, gridHeight);
    grid.init();
    grid.draw(context);
}

init();

