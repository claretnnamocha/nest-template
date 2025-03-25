import { Controller<% if (services && services.length) { %>, Inject<%}%> } from '@nestjs/common';
import { BaseController } from 'src/common';<% if (services && services.length) { %><% services.forEach(function(service) { %>
import { <%= service %> } from './<%= dasherize(service.replace('Service', '')) %>.service';<% }); %><% } %>

@Controller('<%= dasherize(name) %>')
export class <%= classify(name) %>Controller extends BaseController {<% if (services && services.length) { %><% services.forEach(function(service) { %>
  @Inject(<%= service %>) private readonly <%= camelize(service) %>: <%= service %>;<% }); } else { } %>
}
