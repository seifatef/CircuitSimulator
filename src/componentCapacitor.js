import { ComponentDoubleEnded } from "./componentDoubleEnded.js"
import * as MathUtils from "./math.js"


export class ComponentCapacitor extends ComponentDoubleEnded
{
	constructor(pos)
	{
		super(pos)
		
		this.capacitance = 1e-6
		
		this.useTrapezoidalIntegration = true
		this.companionModelResistance = 0
		this.companionModelCurrent = 0
	}
	
	
	static getSaveId()
	{
		return "c"
	}
	
	
	static getName()
	{
		return "Capacitor"
	}
	
	
	saveToString(manager)
	{
		return this.joints[0] + "," + this.joints[1] + "," + MathUtils.valueToStringWithUnitPrefix(this.capacitance) + ","
	}
	
	
	loadFromString(manager, loadData, reader)
	{
		super.loadFromString(manager, loadData, reader)
		this.capacitance = reader.readNumber()
	}
	
	
	solverBegin(manager, solver)
	{
		this.current = 0
		this.currentAnim = 0
		this.companionModelCurrent = 0
		
		if (this.useTrapezoidalIntegration)
		{
			this.companionModelResistance = manager.timePerIteration / (2 * this.capacitance)
			solver.stampResistance(this.nodes[0], this.nodes[1], this.companionModelResistance)
		}
		else
		{
			this.companionModelResistance = manager.timePerIteration / this.capacitance
			solver.stampResistance(this.nodes[0], this.nodes[1], this.companionModelResistance)
		}
	}
	
	
	solverIterationBegin(manager, solver)
	{
		const voltage = manager.getNodeVoltage(this.nodes[0]) - manager.getNodeVoltage(this.nodes[1])
		
		if (this.useTrapezoidalIntegration)
		{
			this.companionModelCurrent = -voltage / this.companionModelResistance - this.current
			solver.stampCurrentSource(this.nodes[0], this.nodes[1], this.companionModelCurrent)
		}
		else
		{
			this.companionModelCurrent = -voltage / this.companionModelResistance
			solver.stampCurrentSource(this.nodes[0], this.nodes[1], this.companionModelCurrent)
		}
	}
	
	
	solverIterationEnd(manager, solver)
	{
		const voltage = manager.getNodeVoltage(this.nodes[0]) - manager.getNodeVoltage(this.nodes[1])
		
		this.current = voltage / this.companionModelResistance + this.companionModelCurrent
	}
	
	
	getEditBox(editBoxDef)
	{
		editBoxDef.addNumberInput("Capacitance", "F", this.capacitance, (x) => { this.capacitance = x })
	}
	
	
	render(manager, ctx)
	{
		const symbolSize = Math.min(15, this.getLength())
		const plateSize  = 25
	
		this.drawSymbolBegin(manager, ctx, symbolSize)
		
		ctx.strokeStyle = "#00FF00"; 
		ctx.beginPath()
		ctx.moveTo(-symbolSize / 2, -plateSize)
		ctx.lineTo(-symbolSize / 2,  plateSize)
		ctx.stroke()
		
		ctx.strokeStyle = "#00FF00"; 
		ctx.beginPath()
		ctx.moveTo( symbolSize / 2, -plateSize)
		ctx.lineTo( symbolSize / 2,  plateSize)
		ctx.stroke()
		
		this.drawSymbolEnd(manager, ctx)
		this.drawRatingText(manager, ctx, this.capacitance, "F")
	}
}