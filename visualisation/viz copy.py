import matplotlib.pyplot as plt
import math
from matplotlib.patches import Patch

def typesToColor(elements, val) :

    if val in elements:
        return "deeppink"
    else :
        return "gold"
    """
    if (integer and string and boolean) :
        return 'peru' # should not happen
    elif (integer and string) :
        return "gold"
    elif (integer and boolean) :
        return "violet"
    elif (boolean and string) :
        return "turquoise"
    elif (integer) :
        return "crimson"
    elif (string) :
        return "mediumblue"
    elif (boolean) :
        return "seagreen"
    else :
        return "black"
    """

Count = {}

def cnt(data, i) :
    for t in types :
        if t in data[i]["info"] :
            if t not in Count :
                Count[t] = {"cnt":0, "sumSteps":0, 'sumAvg':0, 'sizes':0, 'e/s':0, 'a/s':0} 
            Count[t]["cnt"] += 1
            Count[t]["sumSteps"] += data[i]["step"] 
            Count[t]["sumAvg"] += data[i]["avg"]
            Count[t]["sizes"] += data[i]["size"]
            Count[t]["e/s"] += (data[i]["step"]/data[i]["size"])
            Count[t]["a/s"] += (data[i]["avg"]/data[i]["size"])

    res = isOp(data[i]["info"])
    for a in res :
        if a not in Count :
            Count[a] = {"cnt":0, "sumSteps":0, 'sumAvg':0, 'sizes':0, 'e/s':0, 'a/s':0}  
        Count[a]["cnt"] += 1
        Count[a]["sumSteps"] += data[i]["step"] 
        Count[a]["sizes"] += data[i]["size"]
        Count[a]["sumAvg"] += data[i]["avg"]
        Count[a]["e/s"] += (data[i]["step"]/data[i]["size"])
        Count[a]["a/s"] += (data[i]["avg"]/data[i]["size"])


types = ["Int", "String", "Boolean", "List","Tuple", "Annotation", "Fonction","Récursivité","Let"
,"Lambda","Variable","Filtrage","Condition","Maybe","ADT","Do"]


def isOp(elems):
    res = []
    for i in elems :
        if i in ["==", "!=", "<", ">", ">=", "<=", "&&","||"] and ('bool' not in res):
            res.append("Bool_OP")
        if i in ["+", "-","/","*"] and ('math' not in res):
            res.append("Math_OP")
        if i in ["Fst","snd"] and ('tupleOP' not in res):
            res.append("Tuple_OP")
        if i in ["++","Cons"] and ('listOP' not in res):
            res.append("List_OP")
        if i in ["<-",">>=", ">>"] and ('autre' not in res):
            res.append('Monad_IO_OP')
    return res

data = []

with open("testsData.txt") as file:
    for line in file:
        step, avg, size = map(int, line.strip().split(","))

        data.append({
            "step": step,
            "avg": avg,
            "size": size,
        })

info = []
with open ("testsTypes.txt") as file:
    for line in file:
        info.append(line.strip().replace(" ","").split(','))

print(len(info))

ndata = []

for i in range(len(info)) :
    if ('String' not in info[i]) :
        ndata.append(data[i])
    
    data[i]["info"] = info[i]

#data = ndata

# Tri par taille croissante
data.sort(key=lambda x: x["size"])

#colors1 = []
#colors2 = []
#
#for i in range(len(data)) :
#    colors1.append(typesToColor(data[i]["info"], "String"))
#    colors2.append(typesToColor(data[i]["info"], "If"))


steps = [d["step"] for d in data]
avgs = [d["avg"] for d in data]
sizes = [d["size"] for d in data]

stepsOverSize = [d["step"] / d["size"] for d in data]
avgOverSize = [d["avg"] / d["size"] for d in data]
allIn = [d["step"] * d["avg"] / d["size"] for d in data]

graphs = [
    (sizes,"A - Nombre d'étapes par test", steps, "teal", "Étapes"),
    (sizes,"A - Information moyenne par test", avgs, "darkviolet","Lignes"),
    (sizes,"A - Taille des tests", sizes, "orchid","Lexèmes"),
    (sizes,"A - Rapport nombre d'étapes / taille par test", stepsOverSize, "deepskyblue", "Étapes / Lexèmes"),
    (sizes,"A - Rapport information moyenne / taille par test", avgOverSize, "mediumvioletred","Lignes / Lexèmes"),
    (sizes,"A - Rapport nombre d'étapes × information moyenne / taille par test", allIn, "gold", "Étapes × Lignes / Lexèmes"),
]

mean = 0
for i in avgs :
    mean += i

mean = mean / len(avgs)
print(mean)

for i in range(len(data)):
    cnt(data, i)

def ppprint(key) :
    print(key, str(Count[key]["sumSteps"]) + " & " + str(Count[key]["sumAvg"]) + " & " + str(Count[key]["sizes"]) + " & " +
    str(Count[key]["e/s"]) + " & " + str(Count[key]["a/s"]) + " & " + str(Count[key]["stepsAvg/size"])+ " \\\\")

for key in Count :
    Count[key]["sumSteps"] = round(Count[key]["sumSteps"] / Count[key]["cnt"], 2) 
    Count[key]["sumAvg"] = round(Count[key]["sumAvg"] / Count[key]["cnt"],2)
    Count[key]["sizes"] = round(Count[key]["sizes"] / Count[key]["cnt"],2)

    Count[key]["e/s"] = round(Count[key]["e/s"]/Count[key]["cnt"], 2)
    Count[key]["a/s"] = round(Count[key]["a/s"]/Count[key]["cnt"], 2)
    Count[key]["stepsAvg/size"] = round(Count[key]["sumAvg"] * Count[key]["sumSteps"]/ Count[key]["sizes"],2)

    #ppprint(key)

typess = []

for key in Count :
    ppprint(key)
    typess.append({
        "key" : key,
        "sumSteps" : Count[key]["sumSteps"],
        "sumAvg" : Count[key]["sumAvg"],
        "sizes" : Count[key]["sizes"],
        "e/s" : Count[key]["e/s"],
        "a/s" : Count[key]["a/s"],
        "stepsAvg/size" : Count[key]["stepsAvg/size"],
    })

typess.sort(key=lambda x: x["key"])

keysss = [d["key"] for d in typess]
stepsss = [d["sumSteps"] for d in typess]
avgsss = [d["sumAvg"] for d in typess]
sizesss = [d["sizes"] for d in typess]
stepSizes = [d["e/s"] for d in typess]
avgSizes = [d["a/s"] for d in typess]
stepAvgSizes = [d["stepsAvg/size"] for d in typess]

graphs2 = [
    (sizesss, "B - Nombre d'étape en moyenne ("+ r'$\overline{e}$' +") par catégorie de test", stepsss, "teal", "Étapes"),
    (sizesss, "B - Information moyenne en moyenne ("+ r'$\overline{a}$' +") par catégorie de test", avgsss, "darkviolet","Lignes"),
    (sizesss, "B - Taille moyenne des tests ("+ r'$\overline{s}$' +") par catégorie", sizesss, "orchid","Lexèmes"),
    (sizesss, "B - Rapport "+ r'$\overline{e/s}$' +" par catégorie", stepSizes, "deepskyblue", "Étapes / Lexèmes"),
    (sizesss, "B - Rapport "+ r'$\overline{a/s}$' +" par catégorie", avgSizes, "mediumvioletred","Lignes / Lexèmes"),
    (sizesss, "B - Rapport "+ r'$\overline{e} \times \overline{a}\; /\; \overline{s}$' +" par catégorie", stepAvgSizes, "gold", "Étapes "+ r'$\times$' +" Lignes / Lexèmes"),
]

"""
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
ax1.scatter(sizes, stepsOverSize, color=colors1, edgecolors="black", linewidths=0.5)
legend1 = [
    Patch(facecolor='deepskyblue', label="Test sans 'String'"),
    Patch(facecolor='deeppink', label="Test avec 'String'")
]
ax1.legend(handles=legend1)
ax1.set_xlabel("Lexèmes")
ax1.set_ylabel("Étapes / Lexèmes")
ax1.grid(axis="y", linestyle="--", alpha=0.5)
ax1.grid(axis="x", linestyle="--", alpha=0.5)
ax1.set_title("A - Rapport nombre d'étapes / taille par test")


ax2.scatter(sizes, avgOverSize, color=colors1, edgecolors="black", linewidths=0.5)
legend1 = [
    Patch(facecolor='deepskyblue', label="Test sans 'String'"),
    Patch(facecolor='deeppink', label="Test avec 'String'")
]
ax2.legend(handles=legend1)
ax2.set_xlabel("Lexèmes")
ax2.set_ylabel("Lignes / Lexèmes")
ax2.grid(axis="y", linestyle="--", alpha=0.5)
ax2.grid(axis="x", linestyle="--", alpha=0.5)
ax2.set_title("B - Rapport information moyenne / taille par test")
plt.tight_layout()
plt.show()
"""


for (s1, title1, values1, color1, unit1), (s2,title2, values2, color2, unit2) in zip(graphs, graphs2):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5)) # 1 ligne, 2 colonnes
    
    # Premier graphique (de graphs)
    if color1 != 'orchid' :
        ax1.scatter(s1, values1, color=color1, edgecolors="black", linewidths=0.5)
        ax1.set_xlabel("Lexèmes")
    else :
        ax1.bar(range(len(s1)), values1, color=color1)
        ax1.set_xlabel("Tests")

    ax1.set_ylabel(unit1)
    ax1.grid(axis="y", linestyle="--", alpha=0.5)
    ax1.grid(axis="x", linestyle="--", alpha=0.5)
    ax1.set_title(title1)
    
    ax2.bar(keysss, values2, color=color2)
    ax2.set_ylabel(unit2)
    ax2.set_xticks(range(len(keysss)))
    ax2.set_xticklabels(keysss, rotation=45, ha='right', rotation_mode='anchor') # Rotation des ticks
    ax2.grid(axis="y", linestyle="--", alpha=0.5)
    ax2.set_title(title2)

    plt.tight_layout()
    # plt.show() # Affiche la figure à chaque itération
    # plt.savefig(f"graph_{title1}.png") # Ou sauvegardez ici si besoin

plt.show()


"""
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))

# Premier graphique
ax1.scatter(sizes, allIn, color=colors1,edgecolors="black", linewidths=0.5)
legend1 = [
    Patch(facecolor='deeppink', label="Test avec 'String'"),
    Patch(facecolor='gold', label="Test sans 'String'")
]
ax1.legend(handles=legend1)


ax1.set_xlabel("Lexèmes")
ax1.set_ylabel("Étapes × Lignes / Lexèmes")
ax1.grid(axis="y", linestyle="--", alpha=0.5)
ax1.grid(axis="x", linestyle="--", alpha=0.5)
ax1.set_title("A - Rapport nombre d'étapes × information moyenne / taille par test")

ax2.bar(keysss, stepAvgSizes, color="gold")
ax2.set_ylabel("Étapes × Lignes / Lexèmes")
ax2.set_xticks(range(len(keysss)))
ax2.set_xticklabels(keysss, rotation=45, ha='right', rotation_mode='anchor') # Rotation des ticks
ax2.grid(axis="y", linestyle="--", alpha=0.5)
ax2.set_title("B - Rapport e\u0304 × a\u0304 / s\u0304 par catégorie")

plt.tight_layout()
plt.show()
"""