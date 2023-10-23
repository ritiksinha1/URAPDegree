 /**params:
   *   dict: api call from getRules, unparsed json format
   * returns:
   *   dictionary of requirements (each as a dictionary with name, type, courses, k, children)
   **/
 export function parseData(dict) {
    let info = dict.filter(el => el.charAt(0) == 'R')

    let dictRequirements = []

    let x = 0;
    while (x < info.length) {
      let split = info[x].split("', '")
      let name = split[0].match(/'(.+)/)[0].substring(1)
      let type = ''
      let k = ''
      let courses = []
      if(split[1].includes(' and ') && (split[1].includes('AtLeastKCourses') || split[1].includes('AtLeastKUnits') 
          || split[1].includes('All') || split[1].includes('AtLeastOneCourse'))){
        const subReqs = split[1].split(' and ')
        let parentReqs = ""
        let i = 0
        console.log(split[1])
        for (let subReq in subReqs) {
          if (subReq == subReqs.length - 1){
            info.push("Requirement(" + "'" + name + "Option" + i + "', '" + subReqs[subReq] + "")
            parentReqs = parentReqs + "$" + name + "Option" + i
          } 
          else {
            info.push("Requirement(" + "'" + name + "Option" + i + "', '" + subReqs[subReq] + "')")
            parentReqs = parentReqs + "$" + name + "Option" + i + " and "
          }
          i+=1
        } 
        info.push("Requirement(" + "'" + name + "', '" + parentReqs + "')")
        console.log(info)
        x+=1
        continue
      }

      else if(split[1].includes('AtLeastKCourses')){
        type = 'AtLeastKCourses'
        let c = split[1].match(/\[.+\]/)[0]
        c = c.substring(1, c.length-1).replaceAll(' ', '').split(',')
        courses = c
        k = split[1].match(/\], ([0-9]+)/)[1]
        dictRequirements.push({"name": name, "type": type, "courses": courses, "k": k})
      }
      else if(split[1].includes('AtLeastOneCourse')){
        type = 'AtLeastOneCourse'
        let c = split[1].match(/\[.+\]/)[0]
        c = c.substring(1, c.length-1).replaceAll(' ', '').split(',')
        courses = c
        dictRequirements.push({"name": name, "type": type, "courses": courses})
      }
      else if(split[1].includes('AtLeastKUnits')){
        type = 'AtLeastKUnits'
        let c = split[1].match(/\[.+\]/)[0]
        c = c.substring(1, c.length-1).replaceAll(' ', '').split(',')
        courses = c
        k = split[1].match(/\], ([0-9]\.?[0-9]*)/)[1]
        dictRequirements.push({"name": name, "type": type, "courses": courses, "units": k})
      }

      else if(split[1].includes('and')) {
        type='ReqAnd'
        let c = split[1].substring(0, split[1].length-2)
        c = c.split(' and ')
        for (let i in c) {
          c[i] = c[i].substring(1)
        }
        courses = c
        dictRequirements.push({"name": name, "type": type, "reqs": courses})
      }

      else if(split[1].includes('All')){
        type = 'All'
        let c = split[1].match(/\[.+\]/)[0]
        c = c.substring(1, c.length-1).replaceAll(' ', '').split(',')
        courses = c
        dictRequirements.push({"name": name, "type": type, "courses": courses})
      }

      else if(split[1].includes('or')){
        type='ReqOr'
        let c = split[1].substring(0, split[1].length-2)
        c = c.split(' or ')

        for (let i in c) {
          c[i] = c[i].substring(1)
        }
        courses = c
        dictRequirements.push({"name": name, "type": type, "reqs": courses})
      }

      else if(split[1].includes('GreaterThan')){
        type='GreaterThan'
        let k = split[1].match(/[0-9]\.?[0-9]*/)[0]
        let typeReq = split[1].match(/\$([a-zA-Z]+),/)[1]
        if(typeReq == 'GPA') {
          dictRequirements.push({"name": "GPA_req", "type": type, "GPA": k})
        }
        else if(typeReq == 'ResidenceCredits') {
          dictRequirements.push({"name": "residence_req", "type": type, "residence_units": k})
        }
        else if(typeReq == 'Credits') {
          dictRequirements.push({"name": "units_req", "type": type, "units": k})
        }

      }

      else {
        type='ReqAnd'
        let c = split[1].substring(0, split[1].length-2)
        c = c.split(' and ')

        for (let i in c) {
          c[i] = c[i].substring(1)
        }
        courses = c
        dictRequirements.push({"name": name, "type": type, "reqs": courses})
      }
      x += 1

    }
    return dictRequirements

}

export function getAPILink() {
  return "127.0.0.1:1368"
}