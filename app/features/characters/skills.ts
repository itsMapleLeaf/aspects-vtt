export interface SkillTreeAspect {
	tiers: Record<string, SkillTreeTier>
}

export interface SkillTreeTier {
	skills: Record<string, SkillTreeSkill>
}

export interface SkillTreeSkill {
	description: string
}

export const CharacterSkillTree: Record<string, SkillTreeAspect> = {
	fire: {
		tiers: {
			alter: {
				skills: {
					fireResistance: {
						description: `You are less likely to be damaged by fire.`,
					},
					lightningResistance: {
						description: `Lightning has a chance to fizzle or reflect on contact.`,
					},
					suppress: {
						description: `Immediately extinguish any number of exposed fires.`,
					},
					insulate: {
						description: `Cancel the flow of electricity in the surrounding air or in an object.`,
					},
				},
			},
			create: {
				skills: {
					makeLightning: {
						description: `Create a sphere of fire in your palm, enough to power or short-circuit small or medium size devices.`,
					},
					makeFlame: {
						description: `Create a fire in your palm around the size of a baseball.`,
					},
					becomeFlame: {
						description: `Engulf yourself in a bright crackling ember. While in this state, double all damage dealt and all damage received.`,
					},
				},
			},
			control: {
				skills: {
					fireResistance: {
						description: `You are less likely to be damaged by fire.`,
					},
					lightningResistance: {
						description: `Lightning has a chance to fizzle or reflect on contact.`,
					},
					suppress: {
						description: `Immediately extinguish any number of exposed fires.`,
					},
					insulate: {
						description: `Cancel the flow of electricity in the surrounding air or in an object.`,
					},
				},
			},
			integrate: {
				skills: {
					foresee: {
						description: `Become one with the surrounding environment, and predict changing weather conditions in the future.`,
					},
					alterAtmosphere: {
						description: `Change the weather conditions of the surrounding environment.`,
					},
				},
			},
		},
	},
	water: {
		tiers: {
			alter: {
				skills: {
					frostTouch: {
						description: `Touch a surface to send cooling through it.`,
					},
					cooling: {
						description: `Lower the temperature of surrounding air.`,
					},
					moisten: {
						description: `Modify the humidity of surrounding air.`,
					},
				},
			},
			reform: {
				skills: {
					shapeWater: {
						description: `Move, shape, or propel gatherings of water.`,
					},
					shapeIce: {
						description: `Move, break, or reform chunks of ice.`,
					},
				},
			},
			transform: {
				skills: {
					condensate: {
						description: `Gather and collect moisture in the surrounding air into water.`,
					},
					rapidMelt: {
						description: `Rapidly turn ice into water.`,
					},
					flashFreeze: {
						description: `Rapidly turn bodies of water into ice.`,
					},
					solidify: {
						description: `Rapidly turn air moisture into ice.`,
					},
					evaporate: {
						description: `Rapidly evaporate bodies of water.`,
					},
					vaporize: {
						description: `Rapidly turn ice into air moisture.`,
					},
				},
			},
			sense: {
				skills: {
					whispersOfTheMoist: {
						description: `Increase awareness of object through surrounding air moisture.`,
					},
					whispersOfTheSea: {
						description: `Increase awareness of object through bodies of water.`,
					},
					whispersOfFrost: {
						description: `Increase awareness of object through vibrations of ice.`,
					},
				},
			},
			detect: {
				skills: {
					ensnareWater: {
						description: `When learning this skill, choose any liquid. You can control it as if it were water. You may learn this skill multiple times with different choices.`,
					},
				},
			},
		},
	},
	wind: {
		tiers: {
			coincide: {
				skills: {
					formOfAFeather: {
						description: `Move as if under reduced gravity. Fall slowly, jump higher, and perform eased acrobatics.`,
					},
				},
			},
			direct: {
				skills: {
					gust: {
						description: `Create variable-strength haphazard gusts of wind to apply sudden impulses to objects and yourself.`,
					},
					breeze: {
						description: `Increase the wind speed around you to apply sustained forces to objects and yourself. This can allow you to fly.`,
					},
					dampenWind: {
						description: `Decrease or completely cancel the surrounding flow of wind.`,
					},
				},
			},
			shape: {
				skills: {
					shapeWind: {
						description: `Choose a shape when learning this skill, such as a sphere, walls, spikes, or blades. Morph wind into that shape and control its movement. You may learn this skill multiple times with different choices.`,
					},
				},
			},
			modulate: {
				skills: {
					condenseAir: {
						description: `Thicken the density of surrounding air, applying more apparent pressure to those within.`,
					},
					disperse: {
						description: `Decrease the density of surrounding air to a vacuum, depriving subjects within of breathing air.`,
					},
					alterSound: {
						description: `Control the volume and propagation of sound in the surrounding area.`,
					},
				},
			},
			integrate: {
				skills: {
					foresee: {
						description: `Become one with the surrounding environment, and predict changing weather conditions in the future.`,
					},
					alterAtmosphere: {
						description: `Change the weather conditions of the surrounding environment.`,
					},
				},
			},
		},
	},
	light: {
		tiers: {
			illuminate: {
				skills: {
					summonLight: {
						description: `Create and control floating orbs of light.`,
					},
					illuminatingTouch: {
						description: `Touch an object, person, or surface to give them a warming glow. Focusing to maintain.`,
					},
				},
			},
			restore: {
				skills: {
					healingLight: {
						description: `Touch a character to heal their damage.`,
					},
					comfortingLight: {
						description: `Touch a character to heal their fatigue.`,
					},
					strengtheningLight: {
						description: `Touch a character to strengthen them and temporarily increase the power of their actions.`,
					},
				},
			},
			bless: {
				skills: {
					healingAura: {
						description: `Emit a warming glow to heal damage from surrounding characters.`,
					},
					comfortingAura: {
						description: `Emit a comforting glow to heal fatigue from surrounding characters.`,
					},
					strengtheningAura: {
						description: `Emit an uplifting glow to strengthen surrounding characters.`,
					},
				},
			},
			protect: {
				skills: {
					barrier: {
						description: `Conjure large walls of solidified light.`,
					},
					rayOfProtection: {
						description: `Touch a target to surround them with a shield of light that protects them from damaging threats. Focus to maintain.`,
					},
					rayOfJustice: {
						description: `Conjure and direct sharp spears of light towards one or more targets of your choosing.`,
					},
				},
			},
			perceive: {
				skills: {
					discernReality: {
						description: `See everything around you as it is, unaffected by mirages, invisibility, faces, and other forms of light and perception-altering illusions.`,
					},
					pierceReality: {
						description: `See through walls and other solid objects.`,
					},
				},
			},
		},
	},
	darkness: {
		tiers: {
			influence: {
				skills: {
					intimidate: {
						description: `Induce feelings of dread in a character you can see.`,
					},
					charm: {
						description: `Induce feelings of favor or attraction in a character you can see, towards yourself or another character.`,
					},
					spotlight: {
						description: `Increase your presence or that of another nearby character, such that it’s much harder to overlook you.`,
					},
					sneak: {
						description: `Lower your presence or that of another nearby character, such that others are less likely to notice you.`,
					},
				},
			},
			curse: {
				skills: {
					auraOfWeakness: {
						description: `Take on a dark, overpowering glow that physically weakens those nearby.`,
					},
					auraOfSickness: {
						description: `Take on a dark, foreboding glow that mentally weakens those nearby.`,
					},
				},
			},
			deceive: {
				skills: {
					invisibility: {
						description: `Turn invisible, such that visible light passes through you.`,
					},
					disguise: {
						description: `Change the outward appearance of a character or object you can see.`,
					},
				},
			},
			rewrite: {
				skills: {
					alterEmotion: {
						description: `Choose an emotion when learning this skill. Touch a character to change the strength of that emotion in them. You may learn this skill multiple times with different choices.`,
					},
					alterSenses: {
						description: `Choose a sense when learning this skill. Amplify or dampen that sense of a person you can touch. You may learn this skill multiple times with different choices.`,
					},
					alterMemories: {
						description: `Change the memories of a character you can touch.`,
					},
				},
			},
			dematerialize: {
				skills: {
					phase: {
						description: `Float and phase through solid objects.`,
					},
					riftwalk: {
						description: `Create tears in reality to move from one place to another visible location.`,
					},
				},
			},
		},
	},
}
